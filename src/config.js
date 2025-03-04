/**
 * Game configuration
 */
export const gameConfig = {
  // Game dimensions
  width: 800,
  height: 600,
  
  // Theme colors
  colors: {
    background: '#0a0a12',
    primary: '#33de5e',
    secondary: '#ff9933',
    tertiary: '#3366cc',
    dark: '#1a1a2e',
    light: '#cccccc'
  },
  
  // Grid configuration for office scene
  grid: {
    tileSize: 40,
    width: 20,
    height: 15
  },
  
  // Player configuration
  player: {
    startX: 10,
    startY: 10,
    speed: 200,
    interactionRadius: 2
  },
  
  // Interactive objects in the office
  interactiveAreas: {
    // Terminals
    terminal1: {x: 3, y: 4, width: 2, height: 1, message: 'Terminal de desarrollo (próximamente)'},
    terminal2: {x: 3, y: 7, width: 2, height: 1, message: 'Terminal de testing (próximamente)'},
    terminal3: {x: 16, y: 4, width: 2, height: 1, message: 'Terminal de CI/CD (próximamente)'},
    mainTerminal: {x: 16, y: 7, width: 2, height: 1, message: 'Terminal principal - Retos de Docker'},
    
    // Areas of interest
    coffeeMachine: {x: 2, y: 13, width: 1, height: 1, message: '☕ La cafeína es esencial para todo buen SysAdmin'},
    printer: {x: 5, y: 13, width: 1, height: 1, message: '🖨️ La impresora funciona perfectamente... por ahora'},
    fridge: {x: 7, y: 13, width: 1, height: 1, message: '🍕 Alguien dejó pizza de ayer'},
    controlPanel: {x: 14, y: 13, width: 2, height: 1, message: '🔧 Panel de control del sistema. No tocar a menos que sepas lo que haces'},
    meetingTable: {x: 10, y: 8, width: 4, height: 2, message: '📊 Parece que hay documentos sobre un próximo proyecto de Kubernetes'}
  },
  
  // Available challenges
  challenges: [
    {
      id: 'docker-basic',
      title: 'Docker Básico',
      description: 'Configura un contenedor Docker con Nginx para servir una página de estado del sistema.',
      difficulty: 1,
      available: true,
      icon: '🐳',
      reward: 100,
      instructions: `
        <h2>Desafío Nivel 1: Configuración de Docker</h2>
        <p>Como SysAdmin principiante, tu tarea es configurar un contenedor Docker básico para ejecutar un servidor web.</p>
        <p><strong>Contexto:</strong> Tu equipo necesita implementar rápidamente un servidor web para mostrar la página de estado del sistema.</p>
        <p><strong>Objetivo:</strong> Crear y ejecutar un contenedor Docker que utilice la imagen oficial de Nginx.</p>
        <p><strong>Instrucciones:</strong></p>
        <ul>
          <li>Usa el comando <code>docker pull</code> para obtener la imagen de Nginx</li>
          <li>Usa <code>docker run</code> para iniciar un contenedor que exponga el puerto 80</li>
          <li>Verifica que el contenedor esté funcionando con <code>docker ps</code></li>
        </ul>
        <p><strong>Pista:</strong> El comando completo debería incluir mapeo de puertos con la opción <code>-p</code>.</p>
      `
    },
    {
      id: 'kubernetes-basic',
      title: 'Orquestación con K8s',
      description: 'Aprende a implementar aplicaciones en un clúster de Kubernetes.',
      difficulty: 2,
      available: false,
      icon: '☸️',
      reward: 200
    },
    {
      id: 'cicd-pipeline',
      title: 'CI/CD Pipeline',
      description: 'Configura un pipeline de integración y despliegue continuo para una aplicación web.',
      difficulty: 3,
      available: false,
      icon: '🔄',
      reward: 300
    },
    {
      id: 'monitoring',
      title: 'Monitoreo y Alertas',
      description: 'Implementa soluciones de monitoreo para detectar y responder a incidentes.',
      difficulty: 2,
      available: false,
      icon: '📊',
      reward: 250
    }
  ]
};