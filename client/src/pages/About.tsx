import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function About() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#1A1A1A] via-[#0F0F0F] to-[#1A1A1A]">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-[#E0D5CC]">
        <div className="container h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="BC Logo" className="h-8 w-8" />
            <h1 className="text-lg font-bold text-[#C41E3A]">Acerca de - Batalla Cultural</h1>
          </div>
          <Button
            onClick={() => setLocation("/")}
            variant="outline"
            className="border-[#C41E3A] text-[#C41E3A] text-sm"
          >
            Volver
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container py-12 max-w-3xl">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="liquid-glass p-8 rounded-2xl space-y-4 text-center">
            <h2 className="text-4xl font-bold text-[#2D2D2D]">Batalla Cultural</h2>
            <p className="text-lg text-[#C41E3A] font-semibold">
              Contra el pensamiento único
            </p>
            <p className="text-xl text-[#2D2D2D] italic font-light">
              Más libres que nunca. 🗽
            </p>
          </div>

          {/* About Section */}
          <div className="glass-card p-8 rounded-xl space-y-4">
            <h3 className="text-2xl font-bold text-[#2D2D2D]">¿Quiénes Somos?</h3>
            <p className="text-[#666666] leading-relaxed">
              Batalla Cultural es un movimiento independiente dedicado a la promoción de la libertad de expresión, 
              el pensamiento crítico y el análisis político riguroso. Nos comprometemos a proporcionar información 
              objetiva y transparente sobre el panorama político y cultural español.
            </p>
            <p className="text-[#666666] leading-relaxed">
              A través de encuestas, análisis y reportajes, buscamos entender las preocupaciones, valores y 
              aspiraciones de los ciudadanos españoles, independientemente de su ideología política.
            </p>
          </div>

          {/* Mission Section */}
          <div className="glass-card p-8 rounded-xl space-y-4">
            <h3 className="text-2xl font-bold text-[#2D2D2D]">Nuestra Misión</h3>
            <div className="space-y-3 text-[#666666]">
              <div className="flex gap-4">
                <span className="text-2xl">📰</span>
                <div>
                  <p className="font-semibold text-[#2D2D2D]">Noticias</p>
                  <p>Información actualizada sobre los eventos políticos y culturales más relevantes.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="text-2xl">📈</span>
                <div>
                  <p className="font-semibold text-[#2D2D2D]">Encuestas</p>
                  <p>Sondeos rigurosos que reflejan la opinión pública de manera transparente.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="text-2xl">💬</span>
                <div>
                  <p className="font-semibold text-[#2D2D2D]">Opinión</p>
                  <p>Análisis profundos y debates sobre los temas que importan a España.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Values Section */}
          <div className="glass-card p-8 rounded-xl space-y-4">
            <h3 className="text-2xl font-bold text-[#2D2D2D]">Nuestros Valores</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="frosted-glass p-4 rounded-lg space-y-2">
                <p className="font-semibold text-[#2D2D2D]">Libertad</p>
                <p className="text-sm text-[#666666]">
                  Creemos en la libertad de expresión y el derecho a pensar diferente.
                </p>
              </div>
              <div className="frosted-glass p-4 rounded-lg space-y-2">
                <p className="font-semibold text-[#2D2D2D]">Transparencia</p>
                <p className="text-sm text-[#666666]">
                  Todos nuestros datos y metodologías son públicos y verificables.
                </p>
              </div>
              <div className="frosted-glass p-4 rounded-lg space-y-2">
                <p className="font-semibold text-[#2D2D2D]">Independencia</p>
                <p className="text-sm text-[#666666]">
                  Operamos de manera independiente, sin influencias políticas externas.
                </p>
              </div>
              <div className="frosted-glass p-4 rounded-lg space-y-2">
                <p className="font-semibold text-[#2D2D2D]">Rigor</p>
                <p className="text-sm text-[#666666]">
                  Aplicamos metodologías científicas rigurosas en todos nuestros análisis.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="liquid-glass p-8 rounded-2xl space-y-4">
            <h3 className="text-2xl font-bold text-[#2D2D2D]">Conecta con Nosotros</h3>
            <div className="space-y-3">
              <a
                href="https://twitter.com/bcultural_es"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 frosted-glass rounded-lg hover:bg-white hover:bg-opacity-70 transition"
              >
                <span className="text-2xl">𝕏</span>
                <div>
                  <p className="font-semibold text-[#2D2D2D]">Twitter/X</p>
                  <p className="text-sm text-[#666666]">@bcultural_es</p>
                </div>
              </a>
              <a
                href="https://batallacultural.iblogger.org"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 frosted-glass rounded-lg hover:bg-white hover:bg-opacity-70 transition"
              >
                <span className="text-2xl">🌐</span>
                <div>
                  <p className="font-semibold text-[#2D2D2D]">Sitio Web</p>
                  <p className="text-sm text-[#666666]">batallacultural.iblogger.org</p>
                </div>
              </a>
            </div>
          </div>

          {/* Methodology Section */}
          <div className="glass-card p-8 rounded-xl space-y-4">
            <h3 className="text-2xl font-bold text-[#2D2D2D]">Metodología de la Encuesta</h3>
            <div className="space-y-4 text-[#666666] text-sm">
              <div>
                <p className="font-semibold text-[#2D2D2D] mb-1">Tipo de Encuesta</p>
                <p>
                  Encuesta online abierta y participativa que permite a cualquier ciudadano español 
                  expresar su opinión sobre temas políticos y culturales relevantes.
                </p>
              </div>
              <div>
                <p className="font-semibold text-[#2D2D2D] mb-1">Anonimato</p>
                <p>
                  Todas las respuestas son completamente anónimas. No recopilamos información personal 
                  que permita identificar a los encuestados.
                </p>
              </div>
              <div>
                <p className="font-semibold text-[#2D2D2D] mb-1">Distribución de Escaños</p>
                <p>
                  Utilizamos la Ley d'Hondt para distribuir los escaños, el mismo sistema electoral 
                  utilizado en España. En elecciones generales: 350 escaños con umbral del 3%. 
                  En asociaciones juveniles: 50 escaños con umbral del 7%.
                </p>
              </div>
              <div>
                <p className="font-semibold text-[#2D2D2D] mb-1">Transparencia de Datos</p>
                <p>
                  Todos los resultados son públicos y se actualizan en tiempo real. Puedes verificar 
                  los datos en cualquier momento.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center space-y-4 py-8">
            <h3 className="text-2xl font-bold text-[#2D2D2D]">
              ¿Listo para participar?
            </h3>
            <p className="text-[#666666]">
              Tu voz importa. Participa en la encuesta y sé parte del cambio.
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => setLocation("/encuesta")}
                className="bg-[#C41E3A] hover:bg-[#A01830] text-white px-8 h-12 rounded-lg font-semibold"
              >
                Responder Encuesta
              </Button>
              <Button
                onClick={() => setLocation("/resultados")}
                variant="outline"
                className="border-[#C41E3A] text-[#C41E3A] px-8 h-12 rounded-lg font-semibold"
              >
                Ver Resultados
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E0D5CC] bg-white bg-opacity-50 backdrop-blur-sm">
        <div className="container py-8 text-center text-sm text-[#666666]">
          <p>
            III Encuesta de Batalla Cultural © 2025 | Todos los datos son anónimos y públicos
          </p>
        </div>
      </footer>
    </div>
  );
}

