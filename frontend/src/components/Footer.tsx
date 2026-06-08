import { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

export default function Footer() {
    const [mostrarAyuda, setMostrarAyuda] = useState(false);

    return (
        <>
            <footer className="footer">
                <div className="footer-left">
                    <span className="footer-brand">Nevera — ¿Qué hay hoy?</span>
                    <span className="footer-copy">Franco Uribe ©2026</span>
                </div>
                <div className="footer-right">
                    <button
                        onClick={() => setMostrarAyuda(true)}
                        className="footer-help-btn"
                        title="¿Cómo funciona?"
                    >
                        <HelpCircle size={20} />
                    </button>
                </div>
            </footer>

            {mostrarAyuda && (
                <div className="footer-modal-overlay" onClick={() => setMostrarAyuda(false)}>
                    <div className="footer-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="footer-modal-close" onClick={() => setMostrarAyuda(false)}>
                            <X size={18} />
                        </button>

                        <h2>¿Cómo funciona ¿Qué hay hoy?</h2>

                        <h3>Armar Menú</h3>
                        <p>
                            Escribí los ingredientes que tenés en casa, indicá para cuántas personas y cuántos días querés planificar.
                            La app genera un plan de comidas variado priorizando lo que ya tenés, te indica qué falta comprar para cada receta y te da el paso a paso detallado.
                        </p>
                        <p>
                            Si algún ingrediente faltante no lo podés conseguir, seleccionalo y pedile a la app que sugiera un reemplazo automáticamente.
                        </p>
                        <p>
                            ¿No sabés qué cocinar? Usá el botón <strong>Sorpréndeme</strong> y la app te sugiere una receta creativa al instante, con o sin ingredientes cargados.
                        </p>

                        <h3>Consultar Receta</h3>
                        <p>
                            Escribí el nombre de cualquier plato y la app te devuelve los ingredientes con cantidades aproximadas y el paso a paso completo para cocinarlo.
                        </p>

                        <h3>Guardar recetas</h3>
                        <p>
                            Guardá cualquier receta con el ícono del marcador. Quedan almacenadas en tu navegador y podés verlas cuando quieras desde <strong>Guardadas</strong>.
                        </p>

                        <h3> Tip — personalizá tus pedidos</h3>
                        <p>
                            Tanto al cargar ingredientes como al consultar una receta, podés agregar indicaciones especiales. Por ejemplo:
                        </p>
                        <ul>
                            <li> <strong>Vegano</strong> — "arroz, verduras, apto para veganos"</li>
                            <li> <strong>Celíaco</strong> — "pollo, zapallo, sin TACC"</li>
                            <li> <strong>Sin lactosa</strong> — "pasta, sin lácteos"</li>
                            <li> <strong>Alto en proteína</strong> — "receta rica en proteínas"</li>
                            <li> <strong>Rápida</strong> — "algo que tarde menos de 20 minutos"</li>
                        </ul>
                        <p>La IA entiende lenguaje natural, así que podés escribirlo como se te ocurra.</p>
                    </div>
                </div>
            )}
        </>
    );
}