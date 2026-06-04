from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List
import json
from groq import Groq

# Creamos el router en lugar de inicializar FastAPI
router = APIRouter()

# El cliente_groq se inicializa aquí que es donde se usa
cliente_groq = Groq()

# --- MODELOS DE PYDANTIC ---
class PlanRequest(BaseModel):
    ingredientes: List[str]
    personas: int
    dias: int = Field(ge=1, le=7, description="Días a planificar, entre 1 y 7")

class ComprasRequest(BaseModel):
    comidas: List[str] = Field(description="Lista de platos que el usuario quiere cocinar")
    
class SorpresaRequest(BaseModel):
    ingredientes: List[str] = Field(description="Ingredientes disponibles en casa")

class RecetaCompleta(BaseModel):
    dia: str
    nombre: str
    economica: bool = False
    ingredientes_usados: List[str]
    ingredientes_faltantes: List[str]
    pasos: List[str]
    tiempo_minutos: int

class ModificarRecetaRequest(BaseModel):
    receta: RecetaCompleta
    ingredientes_a_reemplazar: List[str]  # <-- Ahora es una lista

# --- ENDPOINTS ---
@router.post("/generar-plan")
def generar_plan(request: PlanRequest):
    ingredientes_str = ", ".join(request.ingredientes)
    
    prompt = f"""
    Eres un chef experto y nutricionista con conocimiento de gastronomía internacional.
    Necesito que me armes un plan de comidas para {request.personas} personas durante {request.dias} días.
    
    Tengo los siguientes ingredientes en casa: {ingredientes_str}.
        
    REGLAS ESTRICTAS:
    1. Las recetas deben ser variadas e ingeniosas, pueden ser de cualquier cocina del mundo (italiana, asiática, mediterránea, latinoamericana, etc.).
    2. Prioriza el uso de los ingredientes que ya tengo.
    3. Nunca repitas la misma proteína principal en días consecutivos.
    4. Cada ingrediente debe incluir una cantidad aproximada multiplicada por {request.personas} personas (ej: si son 2 personas y la base es 200g de carne, escribí "400g de carne picada"). Siempre calculá las cantidades para {request.personas} personas, nunca para 1.    5. Del total de recetas, aproximadamente LA MITAD deben ser opciones económicas (pocos ingredientes faltantes, ingredientes accesibles) y LA OTRA MITAD pueden ser recetas más elaboradas sin priorizar el costo.
    6. Agrega un campo "economica": true/false en cada receta para indicar si es una opción económica o no.
    7. Devuelve ÚNICAMENTE un objeto JSON válido, sin ningún texto antes ni después.
    
    REGLAS PARA LOS PASOS:
    - Cada receta debe tener entre 6 y 10 pasos detallados.
    - Cada paso debe ser una oración completa y clara, explicando exactamente qué hacer, cómo hacerlo y por cuánto tiempo si aplica.
    - Incluí detalles como temperatura, textura esperada, técnica de cocción y tiempos específicos.
    - Ejemplo de paso malo: "Cocinar el pollo".
    - Ejemplo de paso bueno: "Colocar el pollo en la sartén con aceite caliente a fuego medio-alto y sellarlo durante 4 minutos por cada lado hasta que esté dorado por fuera."
    
    La estructura exacta del JSON debe ser esta:
    {{
      "plan": [
        {{
          "dia": "Día 1",
          "nombre": "Nombre del plato",
          "economica": true,
          "ingredientes_usados": ["ingrediente1", "ingrediente2"],
          "ingredientes_faltantes": ["ingrediente3"],
          "pasos": [
            "Paso detallado 1 con técnica, tiempo y resultado esperado.",
            "Paso detallado 2 con técnica, tiempo y resultado esperado."
          ],
          "tiempo_minutos": 45
        }}
      ]
    }}
    """

    try:
        chat_completion = cliente_groq.chat.completions.create(
            messages=[
                {"role": "system", "content": "Eres una API que responde estrictamente en JSON válido."},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        respuesta_texto = chat_completion.choices[0].message.content
        return json.loads(respuesta_texto)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Error 500: El modelo no devolvió un formato JSON válido.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error 500: Hubo un problema con Groq. Detalles: {str(e)}")

@router.post("/generar-lista-compras")
def generar_lista_compras(request: ComprasRequest):
    comidas_str = ", ".join(request.comidas)
    
    prompt = f"""
    Eres un chef experto con conocimiento de gastronomía argentina e internacional.
    El usuario quiere preparar EXACTAMENTE estas comidas: {comidas_str}.
    
    TU TAREA:
    NO inventes ni recomiendes ninguna comida adicional. Analiza ÚNICAMENTE las comidas que el usuario proporcionó.
    Para cada comida, lista los ingredientes con cantidades aproximadas para UNA persona, estima el tiempo de preparación y describe los pasos detallados para cocinarla.
    
    REGLAS ESTRICTAS:
    1. Devuelve ÚNICAMENTE un objeto JSON válido, sin ningún texto antes ni después, ni bloques de markdown.
    2. Usa palabras habituales de la gastronomía argentina.
    3. Cada ingrediente debe incluir una cantidad aproximada para 1 persona (ej: "200g de carne picada", "2 huevos", "1 taza de arroz").
    
    REGLAS PARA LOS PASOS:
    - Cada receta debe tener entre 6 y 10 pasos detallados.
    - Cada paso debe ser una oración completa y clara, explicando exactamente qué hacer, cómo hacerlo y por cuánto tiempo si aplica.
    - Incluí detalles como temperatura, textura esperada, técnica de cocción y tiempos específicos.
    - Ejemplo de paso malo: "Cocinar la carne".
    - Ejemplo de paso bueno: "Colocar la carne picada en la sartén con un chorrito de aceite a fuego medio-alto y cocinarla durante 5 minutos, rompiéndola con una cuchara de madera hasta que pierda el color rosado."
    
    La estructura exacta del JSON debe ser esta:
    {{
      "recetas_pedidas": [
        {{
          "nombre": "Nombre exacto de la comida solicitada",
          "tiempo_minutos": 45,
          "ingredientes": ["200g de ingrediente1", "2 unidades de ingrediente2"],
          "pasos": [
            "Paso detallado 1 con técnica, tiempo y resultado esperado.",
            "Paso detallado 2 con técnica, tiempo y resultado esperado."
          ]
        }}
      ]
    }}
    """

    try:
        chat_completion = cliente_groq.chat.completions.create(
            messages=[
                {"role": "system", "content": "Eres una API que responde estrictamente en JSON válido."},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.3, # Bajamos un poco la temperatura para que sea más preciso y menos creativo
            response_format={"type": "json_object"}
        )

        respuesta_texto = chat_completion.choices[0].message.content
        return json.loads(respuesta_texto)

    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Error 500: El modelo no devolvió un formato JSON válido.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error 500: Hubo un problema con Groq. Detalles: {str(e)}")

@router.post("/sorprendeme")
def generar_sorpresa(request: SorpresaRequest):
    if request.ingredientes:
        contexto_ingredientes = f"El usuario tiene estos ingredientes en casa: {', '.join(request.ingredientes)}. Priorizá usarlos."
    else:
        contexto_ingredientes = "El usuario no especificó ingredientes. Podés sugerir cualquier receta creativa, asumiendo que tiene ingredientes básicos de cocina (aceite, sal, pimienta, ajo, cebolla, huevos)."
    
    prompt = f"""
    Eres un chef experto e innovador. 
    El usuario no quiere pensar qué cocinar hoy y ha presionado el botón "Sorpréndeme".
    {contexto_ingredientes}
    
    TU TAREA:
    Genera UNA SOLA receta, que sea creativa, deliciosa y un poco fuera de lo común.
    
    REGLAS ESTRICTAS:
    1. Debe ser exactamente 1 sola comida.
    2. Agrega un campo "economica": true/false para indicar si requiere comprar cosas caras o no.
    3. Devuelve ÚNICAMENTE un objeto JSON válido, sin ningún texto antes ni después.
    
    La estructura exacta del JSON debe ser esta:
    {{
      "plan": [
        {{
          "nombre": "Nombre del plato creativo",
          "economica": true,
          "ingredientes_usados": ["ingrediente1", "ingrediente2"],
          "ingredientes_faltantes": ["ingrediente extra si hace falta"],
          "pasos": ["Paso 1", "Paso 2"],
          "tiempo_minutos": 30
        }}
      ]
    }}
    """
    try:
        chat_completion = cliente_groq.chat.completions.create(
            messages=[
                {"role": "system", "content": "Eres una API que responde estrictamente en JSON válido."},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.9,
            response_format={"type": "json_object"}
        )
        respuesta_texto = chat_completion.choices[0].message.content
        return json.loads(respuesta_texto)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Error 500: El modelo no devolvió un formato JSON válido.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error 500: Detalles: {str(e)}")

@router.post("/modificar-receta")
def modificar_receta(request: ModificarRecetaRequest):
    receta_original = request.receta.model_dump_json()
    ingredientes_rechazados = ", ".join(request.ingredientes_a_reemplazar)
    
    prompt = f"""
    Eres un chef experto.
    El usuario iba a preparar esta receta: {receta_original}
    
    Sin embargo, el usuario ha decidido que NO TIENE O NO QUIERE USAR estos ingredientes: {ingredientes_rechazados}.
    
    TU TAREA:
    Genera una receta similar que sirva como alternativa, pero que EXCLUYA COMPLETAMENTE esos ingredientes.
    Reemplázalos por alternativas lógicas o cambia ligeramente el plato si es necesario.
    Mantén el mismo formato JSON.
    """
    
    try:
        chat_completion = cliente_groq.chat.completions.create(
            messages=[
                {"role": "system", "content": "Eres una API que responde estrictamente en JSON válido."},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.3, # Baja temperatura para que se ciña a modificar la receta sin cambiarla por completo
            response_format={"type": "json_object"}
        )

        respuesta_texto = chat_completion.choices[0].message.content
        return json.loads(respuesta_texto)

    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Error 500: El modelo no devolvió un formato JSON válido.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error 500: Detalles: {str(e)}")