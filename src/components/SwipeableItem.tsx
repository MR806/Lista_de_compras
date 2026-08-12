import { useState, useRef, TouchEvent, MouseEvent } from 'react';
import { Trash2 } from 'lucide-react';

interface SwipeableItemProps {
  children: React.ReactNode;
  onDelete: () => void;
  confirmMessage?: string;
}

export function SwipeableItem({ children, onDelete, confirmMessage }: SwipeableItemProps) {
  const [translateX, setTranslateX] = useState(0);
  const [isSwiped, setIsSwiped] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const isDragging = useRef(false);
  const maxSwipe = -80; // Largura do botão de apagar

  const handleStart = (clientX: number) => {
    startX.current = clientX;
    currentX.current = clientX;
    isDragging.current = true;
  };

  const handleMove = (clientX: number) => {
    if (!isDragging.current) return;
    const deltaX = clientX - startX.current;
    
    // Permitir apenas deslizar para a esquerda
    let newTranslate = isSwiped ? maxSwipe + deltaX : deltaX;
    if (newTranslate > 0) newTranslate = 0;
    if (newTranslate < maxSwipe - 15) newTranslate = maxSwipe - 15; // Resistência elástica
    
    setTranslateX(newTranslate);
  };

  const handleEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    
    // Decidir se abre ou fecha baseado na posição final
    if (translateX < maxSwipe / 2) {
      setTranslateX(maxSwipe);
      setIsSwiped(true);
    } else {
      setTranslateX(0);
      setIsSwiped(false);
    }
  };

  // Touch handlers
  const onTouchStart = (e: TouchEvent) => handleStart(e.touches[0].clientX);
  const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);
  const onTouchEnd = () => handleEnd();

  // Mouse handlers (suporte para desktop)
  const onMouseDown = (e: MouseEvent) => handleStart(e.clientX);
  const onMouseMove = (e: MouseEvent) => {
    if (isDragging.current) {
      handleMove(e.clientX);
    }
  };
  const onMouseUp = () => handleEnd();
  const onMouseLeave = () => {
    if (isDragging.current) handleEnd();
  };

  const handleDeleteClick = () => {
    if (confirmMessage) {
      if (confirm(confirmMessage)) {
        onDelete();
      }
    } else {
      onDelete();
    }
    // Fechar swipe após ação
    setTranslateX(0);
    setIsSwiped(false);
  };

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '16px',
        width: '100%',
        touchAction: 'pan-y', // Permitir scroll vertical da página
        userSelect: 'none',
      }}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
    >
      {/* Botão de Apagar Vermelho estilo iOS por trás */}
      <button
        type="button"
        onClick={handleDeleteClick}
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: `${Math.abs(maxSwipe)}px`,
          backgroundColor: 'var(--ios-red)',
          color: '#FFFFFF',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 1,
          transition: 'background-color 0.2s',
        }}
      >
        <Trash2 size={22} />
      </button>

      {/* Conteúdo Deslizável */}
      <div
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDragging.current ? 'none' : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'relative',
          zIndex: 2,
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
      >
        {children}
      </div>
    </div>
  );
}
