import { JWTPayload } from "@/app/types/types";
import jwt, {
    type JwtPayload as JsonWebTokenPayload,
} from 'jsonwebtoken';
import { pool } from '@/lib/db/config';
import { headers, cookies } from 'next/headers';

export async function getAuth(): Promise<JWTPayload | null> {
    const headerStore = await headers();
    const authHeader = headerStore.get('authorization');

    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    const cookieStore = await cookies();

    const token = bearerToken ?? cookieStore.get('token')?.value;

    if (!token) {
        return null;
    }

    const publicKey = process.env.JWT_PUBLIC_SECRET?.replace(/\\n/g, '\n');

    if (!publicKey) {
        throw new Error('JWT public key is not configured');
    }

    let payload: JsonWebTokenPayload;

    try {
        payload = jwt.verify(token, publicKey, {
            algorithms: ["ES256"],
        }) as JsonWebTokenPayload;

    } catch (error: any) {
        console.error("JWT verification failed:", error.name, error.message);
        return null;
    }

    if (typeof payload.username !== 'string') {
        return null;
    }

    await pool.query(
        `UPDATE users
         SET last_seen_at = NOW()
         WHERE username = $1
         AND (
             last_seen_at IS NULL
             OR last_seen_at < NOW() - INTERVAL '1 minute'
         )`,
        [payload.username]
    );

    return payload as unknown as JWTPayload;
}