async function getSupabaseClient() {
  const { createClient } = await import('@supabase/supabase-js');
  const supabaseUrl = 'https://hlhzxxeqfznwutgkdvdp.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsaHp4eGVxZnpud3V0Z2tkdmRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMzkxMTEsImV4cCI6MjA3NjkxNTExMX0.PQD752L7jIc-XH76BkqI5owpGFW3QA_TIIe7zYCq7HQ';
  return createClient(supabaseUrl, supabaseAnonKey);
}

export async function registerSurveysRoutes(app: any) {
  app.get('/api/surveys', async (req: any, res: any) => {
    try {
      const supabase = await getSupabaseClient();
      const { data, error } = await supabase
        .from('surveys_questions')
        .select('*')
        .order('question_number', { ascending: false });

      if (error) throw error;
      res.json(data || []);
    } catch (error) {
      console.error('Error fetching surveys:', error);
      res.status(500).json({ error: 'Error al cargar encuestas' });
    }
  });

  app.get('/api/surveys/results/:questionNumber', async (req: any, res: any) => {
    try {
      const supabase = await getSupabaseClient();
      const { questionNumber } = req.params;

      const { data, error } = await supabase
        .from('surveys_results_view')
        .select('*')
        .eq('question_number', parseInt(questionNumber));

      if (error) throw error;
      res.json(data?.[0] || null);
    } catch (error) {
      console.error('Error fetching survey results:', error);
      res.status(500).json({ error: 'Error al cargar resultados' });
    }
  });

  app.get('/api/surveys/results', async (req: any, res: any) => {
    try {
      const supabase = await getSupabaseClient();
      const { data, error } = await supabase
        .from('surveys_results_view')
        .select('*')
        .order('question_number', { ascending: false });

      if (error) throw error;
      res.json(data || []);
    } catch (error) {
      console.error('Error fetching all survey results:', error);
      res.status(500).json({ error: 'Error al cargar resultados' });
    }
  });

  app.post('/api/surveys/respond', async (req: any, res: any) => {
    try {
      const supabase = await getSupabaseClient();
      const { question_number, selected_option, other_text } = req.body;

      if (!question_number || !selected_option) {
        return res.status(400).json({ error: 'Datos incompletos' });
      }

      if (!['O1', 'O2', 'OO'].includes(selected_option)) {
        return res.status(400).json({ error: 'Opción inválida' });
      }

      const voter_id = req.ip || 'anonymous';

      const { data, error } = await supabase
        .from('surveys_responses')
        .insert([
          {
            question_number,
            selected_option,
            other_text: selected_option === 'OO' ? other_text : null,
            voter_id
          }
        ]);

      if (error) throw error;
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error submitting survey response:', error);
      res.status(500).json({ error: 'Error al registrar respuesta' });
    }
  });
}
