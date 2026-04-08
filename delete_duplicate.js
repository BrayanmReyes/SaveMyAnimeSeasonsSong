const SUPABASE_URL = 'https://qlbhdapjajsyhznbodvh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsYmhkYXBqYWpzeWh6bmJvZHZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNjY0NjcsImV4cCI6MjA2OTk0MjQ2N30.iZGe8rQColcutlWq13zpkq5RZaYur4jfOt04p0bW11s';

async function run() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/seasons?select=*`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  });
  const data = await res.json();
  console.log("Seasons:", data);

  // find duplicate
  const names = {};
  for (const s of data) {
    if (names[s.name]) {
      console.log("Found duplicate:", s);
      const delRes = await fetch(`${SUPABASE_URL}/rest/v1/seasons?id=eq.${s.id}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      console.log("Delete status:", delRes.status);
    } else {
      names[s.name] = true;
    }
  }
}
run();
