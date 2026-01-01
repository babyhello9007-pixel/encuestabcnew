import { getDb } from '../db';
import { encuestasVarias, respuestasEncuestasVarias } from '../../drizzle/schema';
import { eq, desc } from 'drizzle-orm';

/**
 * Registrar rutas para API de encuestas varias
 */
export async function registerMiscSurveysRoutes(app: any) {
  /**
   * GET /api/surveys/misc - Obtener todas las encuestas varias
   */
  app.get('/api/surveys/misc', async (req: any, res: any) => {
    try {
      const db = await getDb();
      if (!db) {
        return res.status(500).json({ error: 'Base de datos no disponible' });
      }

      const surveys = await db
        .select()
        .from(encuestasVarias)
        .orderBy(desc(encuestasVarias.questionNumber));

      res.json(surveys || []);
    } catch (error) {
      console.error('Error fetching misc surveys:', error);
      res.status(500).json({ error: 'Error al cargar encuestas varias' });
    }
  });

  /**
   * GET /api/surveys/misc/:questionNumber - Obtener una encuesta varia específica
   */
  app.get('/api/surveys/misc/:questionNumber', async (req: any, res: any) => {
    try {
      const db = await getDb();
      if (!db) {
        return res.status(500).json({ error: 'Base de datos no disponible' });
      }

      const { questionNumber } = req.params;
      
      const survey = await db
        .select()
        .from(encuestasVarias)
        .where(eq(encuestasVarias.questionNumber, parseInt(questionNumber)))
        .limit(1);

      if (survey.length === 0) {
        return res.status(404).json({ error: 'Encuesta no encontrada' });
      }

      res.json(survey[0]);
    } catch (error) {
      console.error('Error fetching misc survey:', error);
      res.status(500).json({ error: 'Error al cargar encuesta varia' });
    }
  });

  /**
   * GET /api/surveys/misc/results/:questionNumber - Obtener resultados de una encuesta varia
   */
  app.get('/api/surveys/misc/results/:questionNumber', async (req: any, res: any) => {
    try {
      const db = await getDb();
      if (!db) {
        return res.status(500).json({ error: 'Base de datos no disponible' });
      }

      const { questionNumber } = req.params;
      
      const survey = await db
        .select()
        .from(encuestasVarias)
        .where(eq(encuestasVarias.questionNumber, parseInt(questionNumber)))
        .limit(1);

      if (survey.length === 0) {
        return res.status(404).json({ error: 'Encuesta no encontrada' });
      }

      const surveyData = survey[0];
      const totalVotes = surveyData.votesO1 + surveyData.votesO2 + surveyData.votesOO;

      const results = {
        questionNumber: surveyData.questionNumber,
        questionText: surveyData.questionText,
        totalVotes,
        options: [
          {
            id: 'O1',
            text: surveyData.optionO1,
            votes: surveyData.votesO1,
            percentage: totalVotes > 0 ? ((surveyData.votesO1 / totalVotes) * 100).toFixed(1) : 0
          },
          {
            id: 'O2',
            text: surveyData.optionO2,
            votes: surveyData.votesO2,
            percentage: totalVotes > 0 ? ((surveyData.votesO2 / totalVotes) * 100).toFixed(1) : 0
          },
          {
            id: 'OO',
            text: surveyData.optionOO,
            votes: surveyData.votesOO,
            percentage: totalVotes > 0 ? ((surveyData.votesOO / totalVotes) * 100).toFixed(1) : 0
          }
        ]
      };

      res.json(results);
    } catch (error) {
      console.error('Error fetching misc survey results:', error);
      res.status(500).json({ error: 'Error al cargar resultados de encuesta varia' });
    }
  });

  /**
   * GET /api/surveys/misc/results - Obtener resultados de todas las encuestas varias
   */
  app.get('/api/surveys/misc/results', async (req: any, res: any) => {
    try {
      const db = await getDb();
      if (!db) {
        return res.status(500).json({ error: 'Base de datos no disponible' });
      }

      const surveys = await db
        .select()
        .from(encuestasVarias)
        .orderBy(desc(encuestasVarias.questionNumber));

      const results = surveys.map((survey: any) => {
        const totalVotes = survey.votesO1 + survey.votesO2 + survey.votesOO;
        return {
          questionNumber: survey.questionNumber,
          questionText: survey.questionText,
          totalVotes,
          options: [
            {
              id: 'O1',
              text: survey.optionO1,
              votes: survey.votesO1,
              percentage: totalVotes > 0 ? ((survey.votesO1 / totalVotes) * 100).toFixed(1) : 0
            },
            {
              id: 'O2',
              text: survey.optionO2,
              votes: survey.votesO2,
              percentage: totalVotes > 0 ? ((survey.votesO2 / totalVotes) * 100).toFixed(1) : 0
            },
            {
              id: 'OO',
              text: survey.optionOO,
              votes: survey.votesOO,
              percentage: totalVotes > 0 ? ((survey.votesOO / totalVotes) * 100).toFixed(1) : 0
            }
          ]
        };
      });

      res.json(results);
    } catch (error) {
      console.error('Error fetching all misc survey results:', error);
      res.status(500).json({ error: 'Error al cargar resultados de encuestas varias' });
    }
  });

  /**
   * POST /api/surveys/misc/submit - Enviar respuesta a una encuesta varia
   */
  app.post('/api/surveys/misc/submit', async (req: any, res: any) => {
    try {
      const db = await getDb();
      if (!db) {
        return res.status(500).json({ error: 'Base de datos no disponible' });
      }

      const { questionNumber, selectedOption } = req.body;

      if (!questionNumber || !selectedOption) {
        return res.status(400).json({ error: 'Datos incompletos' });
      }

      if (!['O1', 'O2', 'OO'].includes(selectedOption)) {
        return res.status(400).json({ error: 'Opción inválida' });
      }

      // Validar que la encuesta existe
      const survey = await db
        .select()
        .from(encuestasVarias)
        .where(eq(encuestasVarias.questionNumber, parseInt(questionNumber)))
        .limit(1);

      if (survey.length === 0) {
        return res.status(404).json({ error: 'Encuesta no encontrada' });
      }

      // Registrar la respuesta
      const response = await db
        .insert(respuestasEncuestasVarias)
        .values({
          encuestaId: survey[0].id,
          questionNumber: parseInt(questionNumber),
          selectedOption
        });

      // Actualizar contadores en la tabla de encuestas
      const updateData: any = {};
      if (selectedOption === 'O1') {
        updateData.votesO1 = survey[0].votesO1 + 1;
      } else if (selectedOption === 'O2') {
        updateData.votesO2 = survey[0].votesO2 + 1;
      } else if (selectedOption === 'OO') {
        updateData.votesOO = survey[0].votesOO + 1;
      }

      await db
        .update(encuestasVarias)
        .set(updateData)
        .where(eq(encuestasVarias.id, survey[0].id));

      res.json({ 
        success: true, 
        message: 'Respuesta registrada exitosamente',
        data: response 
      });
    } catch (error) {
      console.error('Error submitting misc survey response:', error);
      res.status(500).json({ error: 'Error al registrar respuesta' });
    }
  });

  /**
   * POST /api/surveys/misc - Crear una nueva encuesta varia (admin)
   */
  app.post('/api/surveys/misc', async (req: any, res: any) => {
    try {
      const db = await getDb();
      if (!db) {
        return res.status(500).json({ error: 'Base de datos no disponible' });
      }

      const { questionNumber, questionText, optionO1, optionO2, optionOO } = req.body;

      if (!questionNumber || !questionText || !optionO1 || !optionO2 || !optionOO) {
        return res.status(400).json({ error: 'Datos incompletos' });
      }

      const newSurvey = await db
        .insert(encuestasVarias)
        .values({
          questionNumber: parseInt(questionNumber),
          questionText,
          optionO1,
          optionO2,
          optionOO,
          votesO1: 0,
          votesO2: 0,
          votesOO: 0
        });

      res.json({ 
        success: true, 
        message: 'Encuesta varia creada exitosamente',
        data: newSurvey 
      });
    } catch (error) {
      console.error('Error creating misc survey:', error);
      res.status(500).json({ error: 'Error al crear encuesta varia' });
    }
  });

  /**
   * PUT /api/surveys/misc/:questionNumber - Actualizar una encuesta varia (admin)
   */
  app.put('/api/surveys/misc/:questionNumber', async (req: any, res: any) => {
    try {
      const db = await getDb();
      if (!db) {
        return res.status(500).json({ error: 'Base de datos no disponible' });
      }

      const { questionNumber } = req.params;
      const { questionText, optionO1, optionO2, optionOO } = req.body;

      const survey = await db
        .select()
        .from(encuestasVarias)
        .where(eq(encuestasVarias.questionNumber, parseInt(questionNumber)))
        .limit(1);

      if (survey.length === 0) {
        return res.status(404).json({ error: 'Encuesta no encontrada' });
      }

      const updateData: any = {};
      if (questionText) updateData.questionText = questionText;
      if (optionO1) updateData.optionO1 = optionO1;
      if (optionO2) updateData.optionO2 = optionO2;
      if (optionOO) updateData.optionOO = optionOO;

      await db
        .update(encuestasVarias)
        .set(updateData)
        .where(eq(encuestasVarias.id, survey[0].id));

      res.json({ 
        success: true, 
        message: 'Encuesta varia actualizada exitosamente'
      });
    } catch (error) {
      console.error('Error updating misc survey:', error);
      res.status(500).json({ error: 'Error al actualizar encuesta varia' });
    }
  });

  /**
   * DELETE /api/surveys/misc/:questionNumber - Eliminar una encuesta varia (admin)
   */
  app.delete('/api/surveys/misc/:questionNumber', async (req: any, res: any) => {
    try {
      const db = await getDb();
      if (!db) {
        return res.status(500).json({ error: 'Base de datos no disponible' });
      }

      const { questionNumber } = req.params;

      const survey = await db
        .select()
        .from(encuestasVarias)
        .where(eq(encuestasVarias.questionNumber, parseInt(questionNumber)))
        .limit(1);

      if (survey.length === 0) {
        return res.status(404).json({ error: 'Encuesta no encontrada' });
      }

      await db
        .delete(encuestasVarias)
        .where(eq(encuestasVarias.id, survey[0].id));

      res.json({ 
        success: true, 
        message: 'Encuesta varia eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error deleting misc survey:', error);
      res.status(500).json({ error: 'Error al eliminar encuesta varia' });
    }
  });
}
