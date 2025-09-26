import { useState, useEffect } from 'react';

export const useAppMarketAnimation = (visible: boolean) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(visible);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      // 延迟一帧开始进入动画
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      setIsAnimating(false);
      // 等待退出动画完成后再卸载组件
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300); // 动画持续时间
      return () => clearTimeout(timer);
    }
  }, [visible]);

  return {
    isAnimating,
    shouldRender
  };
};