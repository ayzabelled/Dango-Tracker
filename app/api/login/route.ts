import { Pool } from 'pg'; // Or @neondatabase/serverless if using Neon

const pool = new Pool({ connectionString: process.env.DATABASE_URL }); // Or process.env.NEON_CONNECTION_STRING

interface LoginRequest {
    email?: string;
    password?: string;
}

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json() as LoginRequest;

        if (!email || !password) {
            return new Response(JSON.stringify({ error: 'Email and password are required' }), { status: 400 });
        }

        const result = await pool.query('SELECT * FROM "User" WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return new Response(JSON.stringify({ error: 'User not found' }), { status: 401 });
        }

        const user = result.rows[0];

        // IMPORTANT: Compare password hashes, not plain passwords
        const passwordMatch = await comparePasswords(password, user.password); // Implement comparePasswords

        if (passwordMatch) {
            return new Response(JSON.stringify({ message: 'Login successful', user: { id: user.id, email: user.email, name: user.name } }), { status: 200 });
        } else {
            return new Response(JSON.stringify({ error: 'Invalid password' }), { status: 401 });
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error('Error during login:', errorMessage); // Log the message

        return new Response(JSON.stringify({ error: 'Failed to process login', details: errorMessage }), { status: 500 });
    }

}

export async function OPTIONS() { }

// Implement password comparison (using bcrypt or similar)
import bcrypt from 'bcrypt';

async function comparePasswords(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
}