import { createHash, timingSafeEqual } from 'node:crypto';
import { Redis } from '@upstash/redis';
import { del, rename } from '@vercel/blob';

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
const UPDATED_KEY = 'inshub:images:updated';
const PATHNAME_RE = /^images\/[^/\\]+\.(png|jpe?g|webp|gif)$/i;

const metaKey = (pathname: string) => `${META_PREFIX}${pathname}`;

function jsonResponse(data: unknown, init?: ResponseInit) {
    return new Response(JSON.stringify(data), {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...init?.headers,
        },
    });
}

function errorResponse(message: string, status: number) {
    return jsonResponse({ error: message }, { status });
}

function getBearerToken(request: Request): string | null {
    const header = request.headers.get('authorization');
    if (!header) return null;
    const match = /^Bearer\s+(.+)$/i.exec(header);
    return match ? match[1].trim() : null;
}

function tokenMatches(provided: string): boolean {
    const expected = process.env.ADMIN_TOKEN;
    if (!expected) return false;
    const a = createHash('sha256').update(provided).digest();
    const b = createHash('sha256').update(expected).digest();
    return timingSafeEqual(a, b);
}

function authorize(request: Request): boolean {
    const token = getBearerToken(request);
    if (!token) return false;
    return tokenMatches(token);
}

type ZSetEntry = { member: string; score: number };

async function readOrdered(): Promise<ZSetEntry[]> {
    const raw = (await redis.zrange(IMAGES_ZSET, 0, -1, {
        rev: true,
        withScores: true,
    })) as Array<string | number>;

    const entries: ZSetEntry[] = [];
    for (let i = 0; i + 1 < raw.length; i += 2) {
        entries.push({ member: String(raw[i]), score: Number(raw[i + 1]) });
    }
    return entries;
}

async function assertMember(pathname: string): Promise<number> {
    const score = await redis.zscore(IMAGES_ZSET, pathname);
    if (score === null) {
        throw new AdminError(`找不到图片：${pathname}`);
    }
    return score;
}

class AdminError extends Error {}

function sanitizeName(name: string): string {
    const cleaned = name.trim();
    if (!cleaned) {
        throw new AdminError('名称不能为空。');
    }
    if (cleaned.length > 80) {
        throw new AdminError('名称过长（最多 80 个字符）。');
    }
    if (/[/\\]/.test(cleaned)) {
        throw new AdminError('名称不能包含 / 或 \\。');
    }
    if (/^\.+/.test(cleaned)) {
        throw new AdminError('名称不能以点开头。');
    }
    return cleaned;
}

async function handleDelete(body: Record<string, unknown>) {
    const pathname = String(body.pathname ?? '');
    if (!PATHNAME_RE.test(pathname)) {
        throw new AdminError('非法的图片路径。');
    }
    await assertMember(pathname);

    await del(pathname);

    const pipeline = redis.pipeline();
    pipeline.zrem(IMAGES_ZSET, pathname);
    pipeline.del(metaKey(pathname));
    pipeline.del(WARM_KEY);
    pipeline.set(UPDATED_KEY, String(Date.now()));
    await pipeline.exec();

    return { ok: true as const };
}

async function handleRename(body: Record<string, unknown>) {
    const pathname = String(body.pathname ?? '');
    if (!PATHNAME_RE.test(pathname)) {
        throw new AdminError('非法的图片路径。');
    }
    const score = await assertMember(pathname);

    const extMatch = /\.(png|jpe?g|webp|gif)$/i.exec(pathname);
    const ext = extMatch ? extMatch[1].toLowerCase() : '';
    const name = sanitizeName(String(body.name ?? ''));

    const newPathname = `images/${name}.${ext}`;
    const exists = await redis.zscore(IMAGES_ZSET, newPathname);
    if (exists !== null) {
        throw new AdminError('已存在同名图片，请换一个名称。');
    }

    const oldMeta = await redis.hgetall(metaKey(pathname));
    const result = await rename(pathname, newPathname, { access: 'public' });

    const pipeline = redis.pipeline();
    pipeline.zrem(IMAGES_ZSET, pathname);
    pipeline.zadd(IMAGES_ZSET, { score, member: newPathname });
    pipeline.hset(metaKey(newPathname), {
        url: result.url,
        size: oldMeta?.size ?? '',
        contentType: oldMeta?.contentType ?? result.contentType,
        uploadedAt: oldMeta?.uploadedAt ?? new Date().toISOString(),
    });
    pipeline.del(metaKey(pathname));
    pipeline.del(WARM_KEY);
    pipeline.set(UPDATED_KEY, String(Date.now()));
    await pipeline.exec();

    return { ok: true as const, pathname: newPathname };
}

async function handleReorder(body: Record<string, unknown>) {
    const pathname = String(body.pathname ?? '');
    const direction = String(body.direction ?? '') as 'up' | 'down' | 'top' | 'bottom';
    if (!['up', 'down', 'top', 'bottom'].includes(direction)) {
        throw new AdminError('非法的排序指令。');
    }
    await assertMember(pathname);

    const entries = await readOrdered();
    if (entries.length <= 1) {
        return { ok: true as const };
    }

    const index = entries.findIndex((entry) => entry.member === pathname);
    if (index === -1) {
        throw new AdminError(`找不到图片：${pathname}`);
    }

    const scores = entries.map((entry) => entry.score);
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    const current = entries[index].score;

    const updates: { member: string; score: number }[] = [];

    switch (direction) {
        case 'up':
            if (index === 0) return { ok: true as const };
            updates.push(
                { member: entries[index].member, score: entries[index - 1].score },
                { member: entries[index - 1].member, score: current }
            );
            break;
        case 'down':
            if (index === entries.length - 1) return { ok: true as const };
            updates.push(
                { member: entries[index].member, score: entries[index + 1].score },
                { member: entries[index + 1].member, score: current }
            );
            break;
        case 'top':
            if (current >= max) return { ok: true as const };
            updates.push({ member: pathname, score: max + 1 });
            break;
        case 'bottom':
            if (current <= min) return { ok: true as const };
            updates.push({ member: pathname, score: min - 1 });
            break;
    }

    if (updates.length > 0) {
        const pipeline = redis.pipeline();
        for (const { member, score } of updates) {
            pipeline.zadd(IMAGES_ZSET, { score, member });
        }
        await pipeline.exec();
    }

    return { ok: true as const };
}

export async function GET(request: Request) {
    const enabled = Boolean(process.env.ADMIN_TOKEN);
    const valid = enabled && authorize(request);
    return jsonResponse({ enabled, valid });
}

export async function POST(request: Request) {
    if (!process.env.ADMIN_TOKEN) {
        return errorResponse('管理员功能未启用。', 403);
    }
    if (!authorize(request)) {
        return errorResponse('管理员令牌无效或缺失。', 401);
    }

    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body || typeof body !== 'object' || typeof body.action !== 'string') {
        return errorResponse('请求格式不正确。', 400);
    }

    try {
        switch (body.action) {
            case 'delete':
                return jsonResponse(await handleDelete(body));
            case 'rename':
                return jsonResponse(await handleRename(body));
            case 'reorder':
                return jsonResponse(await handleReorder(body));
            default:
                return errorResponse(`未知的操作：${body.action}`, 400);
        }
    } catch (error) {
        if (error instanceof AdminError) {
            return errorResponse(error.message, 400);
        }
        const message = error instanceof Error ? error.message : '操作失败，请稍后再试';
        return errorResponse(message, 400);
    }
}