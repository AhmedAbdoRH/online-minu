const fs = require('fs');
const path = require('path');

const content = `NEXT_PUBLIC_SUPABASE_URL=https://ikelmblsikapgbxbpebz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrZWxtYmxzaWthcGdieGJwZWJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzMzQ4ODIsImV4cCI6MjA3ODkxMDg4Mn0.vsolbFTOeV2iq26d3kvib3cBSOKQ6yk1arpmEqBUt90
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrZWxtYmxzaWthcGdieGJwZWJ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzMzNDg4MiwiZXhwIjoyMDc4OTEwODgyfQ.0zTJzPRsBvYzwNQeP6ZgpwVkzvG11yz1tD6upX35zSQ

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
`;

fs.writeFileSync(path.join(__dirname, '.env.local'), content, { encoding: 'utf8' });
console.log('Successfully wrote .env.local with UTF-8 encoding');
