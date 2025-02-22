import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

interface JournalRequest {
  userId: string;
  title: string;
  date: string; // Keep as string, handle DateTime conversion in database if needed.
  description: string;
}

export async function POST(request: Request) {
  try {
    const { userId, title, date, description } = await request.json() as JournalRequest;

    if (!userId || !title || !date || !description) {
      return new Response(JSON.stringify({ error: 'All fields are required' }), { status: 400 });
    }

    const id = uuidv4();

    // If your database requires a DateTime object, convert 'date' here:
    // const dateObj = new Date(date);  // Make sure 'date' is in a format that Date() can parse

    const result = await pool.query(
      'INSERT INTO "Journal" (id, "userId", title, date, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id, userId, title, date, description] // Use date or dateObj
    );

    const newJournalEntry = result.rows[0];

    return new Response(JSON.stringify({ message: 'Journal entry created', data: newJournalEntry }), { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error('Error creating journal entry:', errorMessage);
    return new Response(JSON.stringify({ error: 'Failed to create journal entry', details: errorMessage }), { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return new Response(JSON.stringify({ error: 'userId is required' }), { status: 400 });
    }

    const result = await pool.query('SELECT * FROM "Journal" WHERE "userId" = $1 ORDER BY date DESC', [userId]); // Order by date!
    const journalEntries = result.rows;

    return new Response(JSON.stringify({ data: journalEntries }), { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error('Error getting journal entries:', errorMessage);
    return new Response(JSON.stringify({ error: 'Failed to get journal entries', details: errorMessage }), { status: 500 });
  }
}


export async function PATCH(request: Request) {
    try {
      const { searchParams } = new URL(request.url);
      const id = searchParams.get('id');
      const { title, date, description } = await request.json(); // Get fields to update
  
      if (!id) { // Check for id
        return new Response(JSON.stringify({ error: 'id is required for update' }), { status: 400 });
      }

      // Construct the UPDATE query dynamically based on provided fields
      let updateQuery = 'UPDATE "Journal" SET ';
      const values = [];
      let paramCount = 1;

      if (title) {
          updateQuery += `title = $${paramCount}, `;
          values.push(title);
          paramCount++;
      }
      if (date) {
        updateQuery += `date = $${paramCount}, `;
        values.push(date);
        paramCount++;
      }
      if (description) {
          updateQuery += `description = $${paramCount}, `;
          values.push(description);
          paramCount++;
      }
      
      // Remove trailing comma if any fields were updated
      if (values.length > 0) {
        updateQuery = updateQuery.slice(0, -2); // Remove last comma and space
      } else {
        return new Response(JSON.stringify({ error: 'No fields to update' }), { status: 400 });
      }


      updateQuery += ` WHERE id = $${paramCount} RETURNING *`;
      values.push(id);


      const result = await pool.query(updateQuery, values);
  
      if (result.rowCount === 0) {
        return new Response(JSON.stringify({ error: 'Record not found' }), { status: 404 });
      }
  
      const updatedJournal = result.rows[0];
      return new Response(JSON.stringify({ message: 'Journal updated', data: updatedJournal }), { status: 200 });
  
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      console.error('Error updating journal:', errorMessage);
      return new Response(JSON.stringify({ error: 'Failed to update journal', details: errorMessage }), { status: 500 });
    }
  }

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new Response(JSON.stringify({ error: 'id is required for deletion' }), { status: 400 });
    }

    const result = await pool.query('DELETE FROM "Journal" WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return new Response(JSON.stringify({ error: 'Journal entry not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: 'Journal entry deleted' }), { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error('Error deleting journal entry:', errorMessage);
    return new Response(JSON.stringify({ error: 'Failed to delete journal entry', details: errorMessage }), { status: 500 });
  }
}

export async function OPTIONS() {}