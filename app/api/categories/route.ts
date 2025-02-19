// api/categories.ts
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

interface CategoryRequest {
    userId: string;
    name: string;
}

export async function POST(request: Request) {
    try {
        const { userId, name } = await request.json() as CategoryRequest;

        if (!userId || !name) {
            return new Response(JSON.stringify({ error: 'userId and name are required' }), { status: 400 });
        }

        const id = uuidv4();
        const result = await pool.query(
            'INSERT INTO "Category" (id, "userId", name) VALUES ($1, $2, $3) RETURNING *',
            [id, userId, name]
        );

        const newCategory = result.rows[0];

        return new Response(JSON.stringify({ message: 'Category created', data: newCategory }), { status: 201 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error('Error creating category:', errorMessage);
        return new Response(JSON.stringify({ error: 'Failed to create category', details: errorMessage }), { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return new Response(JSON.stringify({ error: 'userId is required' }), { status: 400 });
        }

        const result = await pool.query('SELECT * FROM "Category" WHERE "userId" = $1', [userId]);
        const categories = result.rows;

        return new Response(JSON.stringify({ data: categories }), { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error('Error getting categories:', errorMessage);
        return new Response(JSON.stringify({ error: 'Failed to get categories', details: errorMessage }), { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
      const { searchParams } = new URL(request.url);
      const id = searchParams.get('id'); // Get the category ID
  
      if (!id) {
        return new Response(JSON.stringify({ error: 'id is required for deletion' }), { status: 400 });
      }
  
      const result = await pool.query('DELETE FROM "Category" WHERE id = $1 RETURNING *', [id]);
  
      if (result.rowCount === 0) {
        return new Response(JSON.stringify({ error: 'Category not found' }), { status: 404 });
      }
  
      return new Response(JSON.stringify({ message: 'Category deleted' }), { status: 200 });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      console.error('Error deleting category:', errorMessage);
      return new Response(JSON.stringify({ error: 'Failed to delete category', details: errorMessage }), { status: 500 });
    }
  }
  


export async function OPTIONS() {}
