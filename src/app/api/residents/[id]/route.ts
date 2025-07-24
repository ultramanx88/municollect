import { NextResponse } from 'next/server';
import { initialResidents, type Resident } from '@/data/mock-data';

// Read the API Key from environment variables for better security.
const RESIDENT_API_KEY = process.env.RESIDENT_API_KEY;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // 1. Check if the API Key is configured on the server.
  if (!RESIDENT_API_KEY) {
      console.error('API Key is not configured. Set RESIDENT_API_KEY in environment variables.');
      return NextResponse.json({ error: 'Internal Server Error: API configuration is missing.' }, { status: 500 });
  }

  // 2. Secure the endpoint by checking for a valid Authorization header.
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || authHeader !== `Bearer ${RESIDENT_API_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized: API Key is missing or invalid.' }, { status: 401 });
  }

  // 3. Get the resident ID from the URL parameters.
  const residentId = params.id;
  if (!residentId) {
      return NextResponse.json({ error: 'Bad Request: Resident ID is required.' }, { status: 400 });
  }

  // 4. Find the resident in our data source (replace with actual database query).
  const resident = initialResidents.find((r) => r.id === residentId);

  // 5. Respond with the data or a 404 error if not found.
  if (resident) {
    // For security, only return non-sensitive public data.
    // Do not expose email, full address, etc.
    const publicData = {
        id: resident.id,
        name: resident.name,
        isRegistered: true,
    };
    return NextResponse.json(publicData);
  } else {
    return NextResponse.json({ 
        id: residentId,
        isRegistered: false,
        error: 'Resident not found' 
    }, { status: 404 });
  }
}
