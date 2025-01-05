export type SeekingOption = {
  value: string;
  label: string;
  icon: JSX.Element;
};

export interface ProfileSeekingProps {
  seeking?: string[] | null;
  status?: string | null;
  orientation?: string | null;
  onSeekingChange: (seeking: string[]) => void;
}