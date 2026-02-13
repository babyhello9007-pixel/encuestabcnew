import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import CooldownModal from './CooldownModal';

// Mock del componente Dialog
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <div data-testid="dialog-title">{children}</div>,
}));

describe('CooldownModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debe mostrar el modal cuando isOpen es true', () => {
    render(<CooldownModal isOpen={true} remainingMinutes={5} />);
    
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByText('⏳ Cooldown Activo')).toBeInTheDocument();
  });

  it('debe mostrar el tiempo restante correctamente', () => {
    render(<CooldownModal isOpen={true} remainingMinutes={5} />);
    
    // Debe mostrar 05:00 inicialmente (5 minutos = 300 segundos)
    expect(screen.getByText('05:00')).toBeInTheDocument();
  });

  it('debe actualizar el tiempo cada segundo', () => {
    const { rerender } = render(<CooldownModal isOpen={true} remainingMinutes={2} />);
    
    // Inicialmente debe mostrar 02:00
    expect(screen.getByText('02:00')).toBeInTheDocument();
    
    // Avanzar 1 segundo
    vi.advanceTimersByTime(1000);
    
    // Después de 1 segundo, debe mostrar 01:59
    rerender(<CooldownModal isOpen={true} remainingMinutes={2} />);
    expect(screen.getByText('01:59')).toBeInTheDocument();
  });

  it('debe mostrar el mensaje de espera correcto', () => {
    render(<CooldownModal isOpen={true} remainingMinutes={3} />);
    
    expect(screen.getByText(/Debes esperar antes de votar nuevamente/)).toBeInTheDocument();
  });

  it('debe mostrar el mensaje de tiempo restante', () => {
    render(<CooldownModal isOpen={true} remainingMinutes={2} />);
    
    expect(screen.getByText(/Vuelve en 2 minutos y 0 segundos para participar nuevamente/)).toBeInTheDocument();
  });

  it('no debe mostrar el modal cuando isOpen es false', () => {
    const { container } = render(<CooldownModal isOpen={false} remainingMinutes={5} />);
    
    expect(container.querySelector('[data-testid="dialog"]')).not.toBeInTheDocument();
  });

  it('debe mostrar la barra de progreso', () => {
    render(<CooldownModal isOpen={true} remainingMinutes={5} />);
    
    // Buscar el elemento con clase que contiene el gradiente de progreso
    const progressBar = document.querySelector('.bg-gradient-to-r.from-blue-500.to-blue-400');
    expect(progressBar).toBeInTheDocument();
  });

  it('debe mostrar las marcas del reloj', () => {
    render(<CooldownModal isOpen={true} remainingMinutes={5} />);
    
    // Debe haber 12 líneas (marcas del reloj)
    const lines = document.querySelectorAll('line');
    expect(lines.length).toBe(12);
  });
});
