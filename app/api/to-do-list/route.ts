import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

interface TodoListRequest {
  userId: string;
  category: string;
  description: string;
  dueDate: string;
  done: boolean; 
}

export async function POST(request: Request) {
  try {
    const { userId, category, description, dueDate, done } = await request.json() as TodoListRequest; // Include 'done'

    if (!userId || !category || !description || !dueDate) {
      return new Response(JSON.stringify({ error: 'All fields except done are required' }), { status: 400 }); // Updated message
    }

    const id = uuidv4();
    const result = await pool.query(
      'INSERT INTO "TodoList" (id, "userId", category, description, "dueDate", done) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', // Include 'done' in query
      [id, userId, category, description, dueDate, done] 
    );

    const newTodo = result.rows[0];

    return new Response(JSON.stringify({ message: 'Todo created', data: newTodo }), { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error('Error creating todo:', errorMessage);
    return new Response(JSON.stringify({ error: 'Failed to create todo', details: errorMessage }), { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return new Response(JSON.stringify({ error: 'userId is required' }), { status: 400 });
    }

    const result = await pool.query(`
      SELECT "TodoList".*, "Category".name AS categoryName 
      FROM "TodoList" 
      INNER JOIN "Category" ON "TodoList".category::uuid = "Category".id
      WHERE "TodoList"."userId" = $1

    `, [userId]);

    const todos = result.rows;

    return new Response(JSON.stringify({ data: todos }), { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error('Error getting todos:', errorMessage);
    return new Response(JSON.stringify({ error: 'Failed to get todos', details: errorMessage }), { status: 500 });
  }
}

export async function PATCH(request: Request) {  // New PATCH request for updating 'done'
    try {
      const { searchParams } = new URL(request.url);
      const id = searchParams.get('id');
      const { done } = await request.json(); // Get 'done' value from request body
  
      if (!id || done === undefined) { // Check for both id and done
        return new Response(JSON.stringify({ error: 'id and done status are required for update' }), { status: 400 });
      }
      const result = await pool.query(
        'UPDATE "TodoList" SET done = $1 WHERE id = $2 RETURNING *',
        [done, id]
      );
  
      if (result.rowCount === 0) {
        return new Response(JSON.stringify({ error: 'Record not found' }), { status: 404 });
      }
  
      const updatedTodo = result.rows[0];
      return new Response(JSON.stringify({ message: 'Todo updated', data: updatedTodo }), { status: 200 });
  
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      console.error('Error updating todo:', errorMessage);
      return new Response(JSON.stringify({ error: 'Failed to update todo', details: errorMessage }), { status: 500 });
    }
  }
  
  export async function DELETE(request: Request) {
    try {
      const { searchParams } = new URL(request.url);
      const id = searchParams.get('id'); // Get the 'id' of the record to delete
  
      if (!id) {
        return new Response(JSON.stringify({ error: 'id is required for deletion' }), { status: 400 });
      }
  
      const result = await pool.query('DELETE FROM "TodoList" WHERE id = $1 RETURNING *', [id]);
  
      if (result.rowCount === 0) {
        return new Response(JSON.stringify({ error: 'Record not found' }), { status: 404 }); // 404 if not found
      }
  
      const deletedRecord = result.rows;
      return new Response(JSON.stringify({ message: 'To-do record deleted', data: deletedRecord }), { status: 200 });
  
    } catch (error) {
      const errorMessage = error instanceof Error? error.message: "An unknown error occurred";
      console.error('Error deleting to-do record:', errorMessage);
      return new Response(JSON.stringify({ error: 'Failed to delete to-do record', details: errorMessage }), { status: 500 });
    }
  }
  
  export async function OPTIONS() {}
