import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ServerCooldownClock from './ServerCooldownClock';

// Mock de trpc
vi.mock('@/lib/trpc', () => ({
  trpc: {
    time: {
      getCurrentTime: {
        useQuery: vi.fn(() => ({
          data: { timestamp: Date.now(), iso: new Date().toISOString() },
        })),
      },
    },
  },
}));

// Mock del componente Dialog
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <div data-testid="dialog-title">{children}</div>,
}));

describe('ServerCooldownClock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debe mostrar el modal cuando isOpen es true', () => {
    render(<ServerCooldownClock isOpen={true} remainingMinutes={5} />);
    
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
  });

  it('debe mostrar "⏳ Cooldown Activo" cuando hay tiempo restante', () => {
    render(<ServerCooldownClock isOpen={true} remainingMinutes={5} />);
    
    expect(screen.getByText('⏳ Cooldown Activo')).toBeInTheDocument();
  });

  it('debe mostrar el tiempo en formato MM:SS', async () => {
    render(<ServerCooldownClock isOpen={true} remainingMinutes={2} />);
    
    await waitFor(() => {
      expect(screen.getByText(/02:00/)).toBeInTheDocument();
    });
  });

  it('debe actualizar el tiempo cada segundo', async () => {
    render(<ServerCooldownClock isOpen={true} remainingMinutes={1} />);
    
    // Inicialmente debe mostrar 01:00
    await waitFor(() => {
      expect(screen.getByText(/01:00/)).toBeInTheDocument();
    });
    
    // Avanzar 1 segundo
    vi.advanceTimersByTime(1000);
    
    // Debe mostrar 00:59
    await waitFor(() => {
      expect(screen.getByText(/00:59/)).toBeInTheDocument();
    });
  });

  it('debe mostrar "✅ ¡Disponible!" cuando el cooldown termina', async () => {
    const { rerender } = render(<ServerCooldownClock isOpen={true} remainingMinutes={0.01} />);
    
    // Avanzar más de 1 segundo para que termine el cooldown
    vi.advanceTimersByTime(2000);
    
    rerender(<ServerCooldownClock isOpen={true} remainingMinutes={0} />);
    
    await waitFor(() => {
      expect(screen.getByText('✅ ¡Disponible!')).toBeInTheDocument();
    });
  });

  it('debe llamar onCooldownComplete cuando termina el cooldown', async () => {
    const onCooldownComplete = vi.fn();
    
    render(
      <ServerCooldownClock
        isOpen={true}
        remainingMinutes={0.01}
        onCooldownComplete={onCooldownComplete}
      />
    );
    
    // Avanzar más de 1 segundo para que termine el cooldown
    vi.advanceTimersByTime(2000);
    
    await waitFor(() => {
      expect(onCooldownComplete).toHaveBeenCalled();
    });
  });

  it('debe mostrar el mensaje correcto de espera', async () => {
    render(<ServerCooldownClock isOpen={true} remainingMinutes={2} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Debes esperar antes de votar nuevamente/)).toBeInTheDocument();
    });
  });

  it('debe mostrar información de sincronización con servidor', async () => {
    render(<ServerCooldownClock isOpen={true} remainingMinutes={1} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Tiempo sincronizado con servidor/)).toBeInTheDocument();
      expect(screen.getByText(/No se puede manipular el contador/)).toBeInTheDocument();
    });
  });

  it('no debe mostrar el modal cuando isOpen es false', () => {
    const { container } = render(<ServerCooldownClock isOpen={false} remainingMinutes={5} />);
    
    expect(container.querySelector('[data-testid="dialog"]')).not.toBeInTheDocument();
  });
});
