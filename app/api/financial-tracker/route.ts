import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

interface FinancialTrackingRequest {
  userId: string; // Ensure userId is provided
  amount: number;
  category: string;
  type: string;
  date: string; // Send date as string, format it in the backend if needed
  time: string; // Send time as string
}

export async function POST(request: Request) {
  try {
    const { userId, amount, category, type, date, time } = await request.json() as FinancialTrackingRequest;

    if (!userId || !amount || !category || !type || !date || !time) {
      return new Response(JSON.stringify({ error: 'All fields are required' }), { status: 400 });
    }

    const id = uuidv4(); // Generate a UUID for the new record
    const dateTimestamp = `${date} 00:00:00`;
    const timeTimestamp = `1970-01-01 ${time}:00`;
    const result = await pool.query(
      'INSERT INTO "FinancialTracking" (id, "userId", amount, category, type, date, time) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [id, userId, amount, category, type, dateTimestamp, timeTimestamp]

    );

    const newFinancialTracking = result.rows[0];

    return new Response(JSON.stringify({ message: 'Financial tracking record created', data: newFinancialTracking }), { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error('Error creating financial tracking record:', errorMessage);
    return new Response(JSON.stringify({ error: 'Failed to create financial tracking record', details: errorMessage }), { status: 500 });
  }
}


export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return new Response(JSON.stringify({ error: 'userId is required' }), { status: 400 });
        }

        const result = await pool.query('SELECT * FROM "FinancialTracking" WHERE "userId" = $1', [userId]);
        const financialTracking = result.rows;
        let totalAmount = 0;
        for (const entry of financialTracking) {
          totalAmount += entry.amount;
        }
    
        return new Response(JSON.stringify({ data: financialTracking, totalAmount: totalAmount }), { status: 200 }); // Include totalAmount in the response
    
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error('Error getting financial tracking records:', errorMessage);
        return new Response(JSON.stringify({ error: 'Failed to get financial tracking records', details: errorMessage }), { status: 500 });
    }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id'); // Get the 'id' of the record to delete

    if (!id) {
      return new Response(JSON.stringify({ error: 'id is required for deletion' }), { status: 400 });
    }

    const result = await pool.query('DELETE FROM "FinancialTracking" WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return new Response(JSON.stringify({ error: 'Record not found' }), { status: 404 }); // 404 if not found
    }

    const deletedRecord = result.rows;
    return new Response(JSON.stringify({ message: 'Financial tracking record deleted', data: deletedRecord }), { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error? error.message: "An unknown error occurred";
    console.error('Error deleting financial tracking record:', errorMessage);
    return new Response(JSON.stringify({ error: 'Failed to delete financial tracking record', details: errorMessage }), { status: 500 });
  }
}


export async function OPTIONS() {}