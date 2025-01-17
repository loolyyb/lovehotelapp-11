import React from 'react';
import TinderCard from 'react-tinder-card';
import { useSpring, animated } from '@react-spring/web';

interface SwipeCardProps {
  children: React.ReactNode;
  onSwipe: (direction: string) => void;
  onCardLeftScreen?: (direction: string) => void;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({
  children,
  onSwipe,
  onCardLeftScreen
}) => {
  const [props, set] = useSpring(() => ({
    scale: 1,
    config: { mass: 5, tension: 350, friction: 40 }
  }));

  return (
    <TinderCard
      onSwipe={onSwipe}
      onCardLeftScreen={onCardLeftScreen}
      preventSwipe={['up', 'down']}
    >
      <animated.div style={props} className="w-full h-full">
        {children}
      </animated.div>
    </TinderCard>
  );
};