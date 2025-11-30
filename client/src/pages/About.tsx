import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

export default function About() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#D5D5D7] bg-white/80 backdrop-blur-md">
        <div className="container h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="BC Logo" className="h-8 w-8" />
            <h1 className="text-lg font-semibold text-[#1D1D1F]">Acerca de</h1>
          </div>
          <Button
            onClick={() => setLocation("/")}
            variant="outline"
            className="border-[#D5D5D7] text-[#1D1D1F] text-sm hover:bg-[#F5F5F7]"
          >
            Volver
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container py-16 max-w-4xl">
        <div className="space-y-12">
          {/* Hero Section */}
          <div className="space-y-6 text-center">
            <div className="space-y-3">
              <h2 className="text-5xl font-bold text-[#1D1D1F] tracking-tight">Batalla Cultural</h2>
              <p className="text-xl text-[#C41E3A] font-semibold">
                Contra el pensamiento único
              </p>
              <p className="text-lg text-[#666666] font-light">
                Más libres que nunca. 🗽
              </p>
            </div>
          </div>

          {/* About Section */}
          <div className="frosted-glass p-8 rounded-2xl space-y-4">
            <h3 className="text-2xl font-semibold text-[#1D1D1F]">¿Quiénes Somos?</h3>
            <p className="text-[#555555] leading-relaxed text-base">
              Batalla Cultural es un movimiento independiente dedicado a la promoción de la libertad de expresión, 
              el pensamiento crítico y el análisis político riguroso. Nos comprometemos a proporcionar información 
              objetiva y transparente sobre el panorama político y cultural español.
            </p>
            <p className="text-[#555555] leading-relaxed text-base">
              A través de encuestas, análisis y reportajes, buscamos entender las preocupaciones, valores y 
              aspiraciones de los ciudadanos españoles, independientemente de su ideología política.
            </p>
          </div>

          {/* Mission Section */}
          <div className="frosted-glass p-8 rounded-2xl space-y-6">
            <h3 className="text-2xl font-semibold text-[#1D1D1F]">Nuestra Misión</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <span className="text-3xl">📰</span>
                <div>
                  <p className="font-semibold text-[#1D1D1F]">Noticias</p>
                  <p className="text-[#555555] text-sm">Información actualizada sobre los eventos políticos y culturales más relevantes.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="text-3xl">📈</span>
                <div>
                  <p className="font-semibold text-[#1D1D1F]">Encuestas</p>
                  <p className="text-[#555555] text-sm">Sondeos rigurosos que reflejan la opinión pública de manera transparente.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="text-3xl">💬</span>
                <div>
                  <p className="font-semibold text-[#1D1D1F]">Opinión</p>
                  <p className="text-[#555555] text-sm">Análisis profundos y debates sobre los temas que importan a España.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Values Section */}
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-[#1D1D1F]">Nuestros Valores</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="frosted-glass p-6 rounded-xl space-y-2 hover:shadow-lg transition">
                <p className="font-semibold text-[#1D1D1F]">Libertad</p>
                <p className="text-sm text-[#555555]">
                  Creemos en la libertad de expresión y el derecho a pensar diferente.
                </p>
              </div>
              <div className="frosted-glass p-6 rounded-xl space-y-2 hover:shadow-lg transition">
                <p className="font-semibold text-[#1D1D1F]">Transparencia</p>
                <p className="text-sm text-[#555555]">
                  Todos nuestros datos y metodologías son públicos y verificables.
                </p>
              </div>
              <div className="frosted-glass p-6 rounded-xl space-y-2 hover:shadow-lg transition">
                <p className="font-semibold text-[#1D1D1F]">Independencia</p>
                <p className="text-sm text-[#555555]">
                  Operamos de manera independiente, sin influencias políticas externas.
                </p>
              </div>
              <div className="frosted-glass p-6 rounded-xl space-y-2 hover:shadow-lg transition">
                <p className="font-semibold text-[#1D1D1F]">Rigor</p>
                <p className="text-sm text-[#555555]">
                  Aplicamos metodologías científicas rigurosas en todos nuestros análisis.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="liquid-glass p-8 rounded-2xl space-y-6">
            <h3 className="text-2xl font-semibold text-[#1D1D1F]">Conecta con Nosotros</h3>
            <div className="space-y-3">
              <a
                href="https://twitter.com/bcultural_es"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 frosted-glass rounded-xl hover:shadow-md transition"
              >
                <span className="text-2xl">𝕏</span>
                <div>
                  <p className="font-semibold text-[#1D1D1F]">Twitter/X</p>
                  <p className="text-sm text-[#555555]">@bcultural_es</p>
                </div>
              </a>
              <a
                href="https://batallacultural.iblogger.org"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 frosted-glass rounded-xl hover:shadow-md transition"
              >
                <span className="text-2xl">🌐</span>
                <div>
                  <p className="font-semibold text-[#1D1D1F]">Sitio Web</p>
                  <p className="text-sm text-[#555555]">batallacultural.iblogger.org</p>
                </div>
              </a>
            </div>
          </div>

          {/* User Guide Section */}
          <div className="frosted-glass p-8 rounded-2xl space-y-6">
            <h3 className="text-2xl font-semibold text-[#1D1D1F]">Guía de Uso</h3>
            <div className="space-y-4 text-[#555555] text-sm">
              <div>
                <p className="font-semibold text-[#1D1D1F] mb-2">1. Responder la Encuesta</p>
                <p>
                  Haz clic en el botón "Comenzar Encuesta" en la página de inicio. La encuesta consta de 61 preguntas 
                  sobre política, cultura y temas de actualidad. Puedes avanzar y retroceder entre preguntas.
                </p>
              </div>
              <div>
                <p className="font-semibold text-[#1D1D1F] mb-2">2. Tipos de Preguntas</p>
                <p>
                  Encontrarás preguntas de selección única, múltiples opciones, escalas de valoración (0-10) y preguntas abiertas. 
                  Responde con sinceridad para obtener resultados más precisos.
                </p>
              </div>
              <div>
                <p className="font-semibold text-[#1D1D1F] mb-2">3. Ver Resultados</p>
                <p>
                  Accede a la sección "Resultados" para ver los datos en tiempo real. Encontrarás gráficos interactivos, 
                  distribución de escaños y valoraciones de líderes políticos.
                </p>
              </div>
              <div>
                <p className="font-semibold text-[#1D1D1F] mb-2">4. Privacidad</p>
                <p>
                  Todas tus respuestas son completamente anónimas. No recopilamos datos personales. 
                  Tus datos se almacenan de forma segura en Supabase con encriptación.
                </p>
              </div>
              <div>
                <p className="font-semibold text-[#1D1D1F] mb-2">5. Tiempo de Respuesta</p>
                <p>
                  La encuesta toma aproximadamente 5 minutos en completarse. Puedes pausar y continuar más tarde 
                  si es necesario.
                </p>
              </div>
            </div>
          </div>

          {/* Methodology Section */}
          <div className="frosted-glass p-8 rounded-2xl space-y-6">
            <h3 className="text-2xl font-semibold text-[#1D1D1F]">Metodología de la Encuesta</h3>
            <div className="space-y-4 text-[#555555] text-sm">
              <div>
                <p className="font-semibold text-[#1D1D1F] mb-2">Tipo de Encuesta</p>
                <p>
                  Encuesta online abierta y participativa que permite a cualquier ciudadano español 
                  expresar su opinión sobre temas políticos y culturales relevantes.
                </p>
              </div>
              <div>
                <p className="font-semibold text-[#1D1D1F] mb-2">Anonimato</p>
                <p>
                  Todas las respuestas son completamente anónimas. No recopilamos información personal 
                  que permita identificar a los encuestados.
                </p>
              </div>
              <div>
                <p className="font-semibold text-[#1D1D1F] mb-2">Distribución de Escaños</p>
                <p>
                  Utilizamos la Ley d'Hondt para distribuir los escaños, el mismo sistema electoral 
                  utilizado en España. En elecciones generales: 350 escaños con umbral del 3%. 
                  En asociaciones juveniles: 50 escaños con umbral del 7%.
                </p>
              </div>
              <div>
                <p className="font-semibold text-[#1D1D1F] mb-2">Transparencia de Datos</p>
                <p>
                  Todos los resultados son públicos y se actualizan en tiempo real. Puedes verificar 
                  los datos en cualquier momento.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-black text-white rounded-2xl p-12 text-center space-y-6">
            <h3 className="text-3xl font-bold">
              ¿Listo para participar?
            </h3>
            <p className="text-lg text-[#CCCCCC]">
              Tu opinión es valiosa. Dedica unos minutos a responder la encuesta y forma parte de este importante análisis.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button
                onClick={() => setLocation("/nano-encuesta")}
                className="bg-[#C41E3A] hover:bg-[#A01830] text-white px-8 h-12 rounded-lg font-semibold"
              >
                NanoEncuestaBC (5 min)
              </Button>
              <Button
                onClick={() => setLocation("/encuesta")}
                className="bg-[#C41E3A] hover:bg-[#A01830] text-white px-8 h-12 rounded-lg font-semibold"
              >
                Encuesta Completa (20 min)
              </Button>
              <Button
                onClick={() => setLocation("/resultados")}
                variant="outline"
                className="border-white text-white hover:bg-white/10 px-8 h-12 rounded-lg font-semibold"
              >
                Ver Resultados
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#D5D5D7] bg-[#F5F5F7]">
        <div className="container py-8 text-center text-sm text-[#666666]">
          <p>
            La Encuesta de Batalla Cultural © 2025 | Todos los datos son anónimos y públicos
          </p>
        </div>
      </footer>
    </div>
  );
}
