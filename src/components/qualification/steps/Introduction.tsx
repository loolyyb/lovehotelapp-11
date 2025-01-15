interface IntroductionProps {
  onNext: (data: any) => Promise<void>;
  formData: any;
  loading: boolean;
}

export function Introduction({ onNext, formData, loading }: IntroductionProps) {
  const handleNext = () => {
    onNext({});
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-burgundy">
        Bienvenue dans votre parcours de qualification
      </h2>
      <p className="text-gray-600">
        Ce parcours nous permettra de mieux comprendre vos attentes pour personnaliser votre expérience.
      </p>
      <button
        onClick={handleNext}
        disabled={loading}
        className="w-full bg-burgundy text-white py-2 px-4 rounded-lg hover:bg-burgundy/90 transition-colors disabled:opacity-50"
      >
        Commencer
      </button>
    </div>
  );
}