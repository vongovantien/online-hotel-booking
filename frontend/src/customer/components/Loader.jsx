import { useEffect, useState } from 'react';

export default function Loader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="loader_bg">
      <div className="loader">
        <img src="/images/loading.gif" alt="Loading..." />
      </div>
    </div>
  );
}
