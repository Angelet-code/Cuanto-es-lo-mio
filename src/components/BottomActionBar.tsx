import type { ReactNode } from "react";

type BottomActionBarProps = {
  children: ReactNode;
};

export function BottomActionBar({ children }: BottomActionBarProps) {
  return <div className="bottom-action-bar">{children}</div>;
}
