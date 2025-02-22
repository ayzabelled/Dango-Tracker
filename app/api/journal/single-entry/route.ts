import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const id = searchParams.get('id'); // Get the id from the query parameters

        if (!userId || !id) {
            return new Response(JSON.stringify({ error: 'userId and id are required' }), { status: 400 });
        }

        const result = await pool.query('SELECT * FROM "Journal" WHERE "userId" = $1 AND id = $2', [userId, id]);

        if (result.rowCount === 0) {
            return new Response(JSON.stringify({ error: 'Journal entry not found' }), { status: 404 });
        }

        const journalEntry = result.rows[0];
        return new Response(JSON.stringify({ data: [journalEntry] }), { status: 200 }); // Return as an array to keep consistent with other responses
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error('Error getting journal entry:', errorMessage);
        return new Response(JSON.stringify({ error: 'Failed to get journal entry', details: errorMessage }), { status: 500 });
    }
}
