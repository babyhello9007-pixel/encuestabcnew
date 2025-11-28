import { useEffect } from "react";

export function TwitterFeed() {
  useEffect(() => {
    // Cargar el script de Twitter para embeber tweets
    const script = document.createElement("script");
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    script.charset = "utf-8";
    document.body.appendChild(script);

    return () => {
      // Limpiar el script cuando el componente se desmonte
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <section className="py-16 bg-gradient-to-br from-[#F5F5F5] to-[#EEEEEE]">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#2D2D2D] mb-2">Últimas Noticias</h2>
          <p className="text-[#666666]">Síguenos en X (Twitter) para estar al día</p>
        </div>

        <div className="flex justify-center">
          <a
            className="twitter-timeline"
            data-theme="light"
            data-height="600"
            data-width="500"
            href="https://twitter.com/bcultural_es"
          >
            Tweets by @bcultural_es
          </a>
        </div>

        <div className="text-center mt-8">
          <a
            href="https://twitter.com/bcultural_es"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-[#1DA1F2] text-white rounded-full font-semibold hover:bg-[#1a8cd8] transition-colors"
          >
            Seguir en X
          </a>
        </div>
      </div>
    </section>
  );
}

