import bcrypt from 'bcrypt';
import { pool } from '@/lib/db/config';
import { AuthType } from '@/app/types/types';
import { cookies } from 'next/headers';
import { JWTPayload } from 'jose';

export async function registerService({ username, password }: AuthType) {
    const hashed = await bcrypt.hash(password, 10);
    const text = `
        insert into users (username, password) values
        ($1, $2)
        returning *
    `;

    const result = await pool.query(text, [username, hashed]);
    return result.rows;
}

export async function loginService({ username, password }: AuthType) {
    const user = await pool.query(`
            select * from users where username = $1
        `, [username]);

    if (user.rows.length === 0) {
        throw Error('username doesn\'t exist');
    }

    if (user.rows[0].role != 'user') {
        throw Error('username doesn\'t exist');
    }

    const hashed = user.rows[0].password;
    const benar = await bcrypt.compare(password, hashed);
    if (!benar) {
        throw Error('incorrect password!');
    }

    const { password: _, ...userData } = user.rows[0];
    const payload: JWTPayload = {
        username: userData.username,
        role: userData.role
    }

    return payload;
}


export async function adminLoginService({username, password}: AuthType) {
    const user = await pool.query(
        `SELECT * FROM users WHERE username = $1`,
        [username]
    );

    if (user.rows.length === 0) {
        throw Error("username doesn't exist");
    }

    if (user.rows[0].role !== 'admin') {
        throw Error('account is not an admin');
    }

    const hashed = user.rows[0].password;
    const benar = await bcrypt.compare(password, hashed);

    if (!benar) {
        throw Error('incorrect password!');
    }

    const { password: _, ...userData } = user.rows[0];

    return {
        username: userData.username,
        role: userData.role
    };
}


export async function getUserData(username : string) {
    try {
        const result = await pool.query(`
                select username, role, score, last_seen_at
                from users
                where username = $1
            `, [username]);
        return result.rows[0];
    } catch (error) {
        throw error;
    }
}

export async function logoutService() {
    const cookie = await cookies();
    cookie.delete('token');
}