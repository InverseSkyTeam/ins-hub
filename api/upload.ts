import { Redis } from '@upstash/redis';
import { handleUpload } from '@vercel/blob/client';

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
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_CONTENT_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
const IMAGE_EXT = /\.(png|jpe?g|webp|gif)$/i;

const metaKey = (pathname: string) => `${META_PREFIX}${pathname}`;

function parseClientPayload(clientPayload: string | null | undefined): {
    size?: number;
} {
    if (!clientPayload) return {};
    try {
        const parsed = JSON.parse(clientPayload) as { size?: number; originalName?: string };
        return typeof parsed === 'object' && parsed !== null ? parsed : {};
    } catch {
        return {};
    }
}

export async function POST(request: Request) {
    const body = await request.json();

    try {
        const result = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (pathname, clientPayload) => {
                if (!pathname.startsWith('images/') || !IMAGE_EXT.test(pathname)) {
                    throw new Error('只允许将图片上传到 images/ 目录。');
                }
                const { size } = parseClientPayload(clientPayload);
                return {
                    addRandomSuffix: true,
                    allowedContentTypes: ALLOWED_CONTENT_TYPES,
                    maximumSizeInBytes:
                        size && size > 0 ? Math.min(size, MAX_FILE_SIZE) : MAX_FILE_SIZE,
                    tokenPayload: clientPayload ?? null,
                };
            },
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                const { size } = parseClientPayload(tokenPayload);
                const now = Date.now();

                const pipeline = redis.pipeline();
                pipeline.zadd(IMAGES_ZSET, { score: now, member: blob.pathname });
                pipeline.hset(metaKey(blob.pathname), {
                    url: blob.url,
                    size: size && size > 0 ? String(size) : '',
                    contentType: blob.contentType,
                    uploadedAt: new Date(now).toISOString(),
                });
                pipeline.del(WARM_KEY);
                await pipeline.exec();
            },
        });

        return new Response(JSON.stringify(result), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
