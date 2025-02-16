import { Pool } from 'pg'; // Or @neondatabase/serverless if using Neon
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const pool = new Pool({ connectionString: process.env.DATABASE_URL }); // Or process.env.NEON_CONNECTION_STRING

interface RegisterRequest {
  email?: string;
  password?: string;
  name?: string; // Add name field
}

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json() as RegisterRequest; // Include name

    if (!email || !password || !name) { // Check for all required fields
      return new Response(JSON.stringify({ error: 'Email, password, and name are required' }), { status: 400 });
    }

    // Check if the email is already taken
    const emailCheck = await pool.query('SELECT * FROM "User" WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
        return new Response(JSON.stringify({ error: 'Email is already taken' }), { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10); // Hash the password

    // OR, generate UUID in code:
    const userId = uuidv4();
    const result = await pool.query(
        'INSERT INTO "User" (id, email, password, name) VALUES ($1, $2, $3, $4) RETURNING *',
        [userId, email, passwordHash, name]
     );

    const newUser = result.rows[0];

    return new Response(
      JSON.stringify({
        message: 'User registered successfully',
        user: { id: newUser.id, email: newUser.email, name: newUser.name }, // Return user details
      }),
      { status: 201 } // 201 Created status code
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error('Error during registration:', errorMessage);
    return new Response(
      JSON.stringify({ error: 'Failed to register user', details: errorMessage }),
      { status: 500 }
    );
  }
}

export async function OPTIONS() {} // Important for CORS if needed