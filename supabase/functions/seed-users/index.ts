import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SeedUser {
  id: string;
  email: string;
  password: string;
  full_name: string;
  role: string;
  institute_id?: string;
  phone?: string;
}

const SEED_USERS: SeedUser[] = [
  // Super Admin
  {
    id: 'a0000000-0000-0000-0000-000000000000',
    email: 'admin@edunest.com',
    password: 'AdminPass123!',
    full_name: 'System Administrator',
    role: 'super_admin',
    phone: '+1-555-ADMIN-01'
  },
  // Institute 1 - Manager
  {
    id: '10000000-0000-0000-0000-000000000001',
    email: 'manager@almanar.edu',
    password: 'ManagerPass123!',
    full_name: 'Ahmad Hassan',
    role: 'institute_manager',
    institute_id: '11111111-1111-1111-1111-111111111111',
    phone: '+962-7-90123456'
  },
  // Institute 1 - Teachers
  {
    id: '11000000-0000-0000-0000-000000000001',
    email: 'teacher1@almanar.edu',
    password: 'TeacherPass123!',
    full_name: 'Dr. Khalid Omar',
    role: 'teacher',
    institute_id: '11111111-1111-1111-1111-111111111111',
    phone: '+962-7-91111111'
  },
  {
    id: '11000000-0000-0000-0000-000000000002',
    email: 'teacher2@almanar.edu',
    password: 'TeacherPass123!',
    full_name: 'Ms. Sara Mahmoud',
    role: 'teacher',
    institute_id: '11111111-1111-1111-1111-111111111111',
    phone: '+962-7-92222222'
  },
  {
    id: '11000000-0000-0000-0000-000000000003',
    email: 'teacher3@almanar.edu',
    password: 'TeacherPass123!',
    full_name: 'Mr. Youssef Ali',
    role: 'teacher',
    institute_id: '11111111-1111-1111-1111-111111111111',
    phone: '+962-7-93333333'
  },
  {
    id: '11000000-0000-0000-0000-000000000004',
    email: 'teacher4@almanar.edu',
    password: 'TeacherPass123!',
    full_name: 'Ms. Fatima Zaid',
    role: 'teacher',
    institute_id: '11111111-1111-1111-1111-111111111111',
    phone: '+962-7-94444444'
  },
  {
    id: '11000000-0000-0000-0000-000000000005',
    email: 'teacher5@almanar.edu',
    password: 'TeacherPass123!',
    full_name: 'Dr. Omar Khaled',
    role: 'teacher',
    institute_id: '11111111-1111-1111-1111-111111111111',
    phone: '+962-7-95555555'
  },
  // Institute 1 - Students
  {
    id: '12000000-0000-0000-0000-000000000001',
    email: 'student1@almanar.edu',
    password: 'StudentPass123!',
    full_name: 'Ahmad Mahmoud',
    role: 'student',
    institute_id: '11111111-1111-1111-1111-111111111111',
    phone: '+962-7-96111111'
  },
  {
    id: '12000000-0000-0000-0000-000000000002',
    email: 'student2@almanar.edu',
    password: 'StudentPass123!',
    full_name: 'Lina Khalid',
    role: 'student',
    institute_id: '11111111-1111-1111-1111-111111111111',
    phone: '+962-7-96222222'
  },
  {
    id: '12000000-0000-0000-0000-000000000003',
    email: 'student3@almanar.edu',
    password: 'StudentPass123!',
    full_name: 'Youssef Ahmad',
    role: 'student',
    institute_id: '11111111-1111-1111-1111-111111111111',
    phone: '+962-7-96333333'
  },
  {
    id: '12000000-0000-0000-0000-000000000004',
    email: 'student4@almanar.edu',
    password: 'StudentPass123!',
    full_name: 'Fatima Omar',
    role: 'student',
    institute_id: '11111111-1111-1111-1111-111111111111',
    phone: '+962-7-96444444'
  },
  {
    id: '12000000-0000-0000-0000-000000000005',
    email: 'student5@almanar.edu',
    password: 'StudentPass123!',
    full_name: 'Khaled Hassan',
    role: 'student',
    institute_id: '11111111-1111-1111-1111-111111111111',
    phone: '+962-7-96555555'
  },
  {
    id: '12000000-0000-0000-0000-000000000006',
    email: 'student6@almanar.edu',
    password: 'StudentPass123!',
    full_name: 'Sara Ali',
    role: 'student',
    institute_id: '11111111-1111-1111-1111-111111111111',
    phone: '+962-7-96666666'
  },
  {
    id: '12000000-0000-0000-0000-000000000007',
    email: 'student7@almanar.edu',
    password: 'StudentPass123!',
    full_name: 'Mahmoud Youssef',
    role: 'student',
    institute_id: '11111111-1111-1111-1111-111111111111',
    phone: '+962-7-96777777'
  },
  {
    id: '12000000-0000-0000-0000-000000000008',
    email: 'student8@almanar.edu',
    password: 'StudentPass123!',
    full_name: 'Omar Fatima',
    role: 'student',
    institute_id: '11111111-1111-1111-1111-111111111111',
    phone: '+962-7-96888888'
  },
  {
    id: '12000000-0000-0000-0000-000000000009',
    email: 'student9@almanar.edu',
    password: 'StudentPass123!',
    full_name: 'Hassan Lina',
    role: 'student',
    institute_id: '11111111-1111-1111-1111-111111111111',
    phone: '+962-7-96999999'
  },
  {
    id: '12000000-0000-0000-0000-000000000010',
    email: 'student10@almanar.edu',
    password: 'StudentPass123!',
    full_name: 'Ali Ahmad',
    role: 'student',
    institute_id: '11111111-1111-1111-1111-111111111111',
    phone: '+962-7-96000000'
  },
  // Institute 1 - Parents
  {
    id: '13000000-0000-0000-0000-000000000001',
    email: 'parent1@almanar.edu',
    password: 'ParentPass123!',
    full_name: 'Mr. Mahmoud Ahmad',
    role: 'parent',
    institute_id: '11111111-1111-1111-1111-111111111111',
    phone: '+962-7-97111111'
  },
  {
    id: '13000000-0000-0000-0000-000000000002',
    email: 'parent2@almanar.edu',
    password: 'ParentPass123!',
    full_name: 'Mrs. Khalid Lina',
    role: 'parent',
    institute_id: '11111111-1111-1111-1111-111111111111',
    phone: '+962-7-97222222'
  },
  {
    id: '13000000-0000-0000-0000-000000000003',
    email: 'parent3@almanar.edu',
    password: 'ParentPass123!',
    full_name: 'Mr. Ahmad Youssef',
    role: 'parent',
    institute_id: '11111111-1111-1111-1111-111111111111',
    phone: '+962-7-97333333'
  },
  {
    id: '13000000-0000-0000-0000-000000000004',
    email: 'parent4@almanar.edu',
    password: 'ParentPass123!',
    full_name: 'Mrs. Omar Fatima',
    role: 'parent',
    institute_id: '11111111-1111-1111-1111-111111111111',
    phone: '+962-7-97444444'
  },
  {
    id: '13000000-0000-0000-0000-000000000005',
    email: 'parent5@almanar.edu',
    password: 'ParentPass123!',
    full_name: 'Mr. Hassan Khaled',
    role: 'parent',
    institute_id: '11111111-1111-1111-1111-111111111111',
    phone: '+962-7-97555555'
  },
  // Institute 2 - Bright Future Academy
  {
    id: '20000000-0000-0000-0000-000000000001',
    email: 'manager@brightfuture.ae',
    password: 'ManagerPass123!',
    full_name: 'Sarah Johnson',
    role: 'institute_manager',
    institute_id: '22222222-2222-2222-2222-222222222222',
    phone: '+971-50-1234567'
  },
  {
    id: '21000000-0000-0000-0000-000000000006',
    email: 'teacher@brightfuture.ae',
    password: 'TeacherPass123!',
    full_name: 'James Smith',
    role: 'teacher',
    institute_id: '22222222-2222-2222-2222-222222222222',
    phone: '+971-50-2345678'
  },
  {
    id: '22000000-0000-0000-0000-000000000011',
    email: 'student@brightfuture.ae',
    password: 'StudentPass123!',
    full_name: 'Emma Wilson',
    role: 'student',
    institute_id: '22222222-2222-2222-2222-222222222222',
    phone: '+971-50-3456789'
  }
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const results = {
      created: [] as string[],
      skipped: [] as string[],
      errors: [] as { email: string; error: string }[]
    };

    for (const user of SEED_USERS) {
      try {
        // Check if user already exists
        const { data: existing, error: lookupError } = await supabase.auth.admin.getUserById(user.id);

        // If user exists, skip
        if (existing?.user) {
          results.skipped.push(user.email);
          continue;
        }

        // If error is NOT "User not found", it's a real error
        if (lookupError && lookupError.message !== 'User not found') {
          results.errors.push({ email: user.email, error: lookupError.message });
          continue;
        }

        // Create user with specific UUID
        const { data, error } = await supabase.auth.admin.createUser({
          id: user.id,
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: {
            full_name: user.full_name,
            role: user.role,
            institute_id: user.institute_id,
            phone: user.phone
          }
        });

        if (error) {
          results.errors.push({ email: user.email, error: error.message });
        } else {
          results.created.push(user.email);
        }
      } catch (err) {
        results.errors.push({ 
          email: user.email, 
          error: err instanceof Error ? err.message : 'Unknown error' 
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          total: SEED_USERS.length,
          created: results.created.length,
          skipped: results.skipped.length,
          errors: results.errors.length
        },
        details: results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});