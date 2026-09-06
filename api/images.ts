import { Redis } from '@upstash/redis';
import { list } from '@vercel/blob';
import type { ListBlobResultBlob } from '@vercel/blob';

export const config = { runtime: 'nodejs' };

function redisFromEnv() {
    const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
    if (!url || !token) {
        throw new Error(
            '缺少 Redis 环境变量（UPSTASH_REDIS_REST_URL/TOKEN 或 KV_REST_API_URL/TOKEN）。'
        );
    }
    return new Redis({ url, token });
}

const redis = redisFromEnv();

const IMAGES_ZSET = 'inshub:images';
const META_PREFIX = 'inshub:meta:';
const WARM_KEY = 'inshub:images:warm';
const WARM_TTL_SECONDS = 300;
const UPDATED_KEY = 'inshub:images:updated';
const SYNCED_KEY = 'inshub:images:synced';
const IMAGE_EXT = /\.(png|jpe?g|webp|gif)$/i;

type ImageRecord = {
    id: string;
    name: string;
    pathname: string;
    url: string;
    size?: number;
    contentType?: string;
    uploadedAt?: string;
};

const metaKey = (pathname: string) => `${META_PREFIX}${pathname}`;

function blobToMeta(blob: ListBlobResultBlob): Record<string, string> {
    return {
        url: blob.url,
        size: String(blob.size),
        uploadedAt: blob.uploadedAt.toISOString(),
    };
}

async function listAllBlobs(): Promise<ListBlobResultBlob[]> {
    let cursor: string | undefined;
    let hasMore = true;
    const blobs: ListBlobResultBlob[] = [];
    while (hasMore) {
        const page = await list({ prefix: 'images/', mode: 'expanded', cursor });
        blobs.push(...page.blobs);
        cursor = page.cursor;
        hasMore = page.hasMore;
    }
    return blobs;
}

async function rebuildIndex() {
    const blobs = await listAllBlobs();
    const images = blobs.filter((blob) => IMAGE_EXT.test(blob.pathname));

    const raw = (await redis.zrange(IMAGES_ZSET, 0, -1, {
        withScores: true,
    })) as Array<string | number>;
    const existingScores = new Map<string, number>();
    for (let i = 0; i + 1 < raw.length; i += 2) {
        existingScores.set(String(raw[i]), Number(raw[i + 1]));
    }

    const pipeline = redis.pipeline();
    pipeline.del(IMAGES_ZSET);
    for (const blob of images) {
        pipeline.zadd(IMAGES_ZSET, {
            score: existingScores.get(blob.pathname) ?? blob.uploadedAt.getTime(),
            member: blob.pathname,
        });
        pipeline.hset(metaKey(blob.pathname), blobToMeta(blob));
    }
    await pipeline.exec();

    if (images.length === 0) {
        await redis.set(WARM_KEY, '1', { ex: WARM_TTL_SECONDS });
    } else {
        await redis.del(WARM_KEY);
    }
}

async function hydrate(pathnames: string[]): Promise<ImageRecord[]> {
    if (pathnames.length === 0) return [];

    const pipeline = redis.pipeline();
    for (const pathname of pathnames) {
        pipeline.hgetall(metaKey(pathname));
    }
    const metas = (await pipeline.exec()) as (Record<string, string> | null)[];

    return pathnames
        .map((pathname, index): ImageRecord => {
            const meta = metas[index] ?? {};
            return {
                id: pathname,
                name: pathname.replace(/^images\//, ''),
                pathname,
                url: meta.url ?? '',
                size: meta.size ? Number(meta.size) : undefined,
                uploadedAt: meta.uploadedAt,
            };
        })
        .filter((record) => record.url.length > 0);
}

function jsonResponse(data: unknown, init?: ResponseInit) {
    return new Response(JSON.stringify(data), {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...init?.headers,
        },
    });
}

export async function GET(request: Request) {
    const refresh = new URL(request.url).searchParams.get('refresh') === 'true';

    const updated = Number((await redis.get(UPDATED_KEY)) ?? 0);
    const synced = Number((await redis.get(SYNCED_KEY)) ?? 0);
    const pendingSync = updated > synced;

    if (refresh || pendingSync) {
        await rebuildIndex();
        if (pendingSync) {
            await redis.set(SYNCED_KEY, String(updated));
        }
    } else {
        const cached = await redis.zrange(IMAGES_ZSET, 0, -1, { rev: true });
        if (cached.length === 0) {
            const isWarm = await redis.exists(WARM_KEY);
            if (!isWarm) {
                await rebuildIndex();
            }
        }
    }

    const pathnames = (await redis.zrange(IMAGES_ZSET, 0, -1, { rev: true })) as string[];
    return jsonResponse(await hydrate(pathnames));
}
