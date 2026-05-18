type TitleSubtitleProps = {
  title: string | React.ReactNode;
  subtitle: string;
  action?: React.ReactNode;
  titleClassName?: string;
  subtitleClassName?: string;
  className?: string;
};

const TitleSubtitle: React.FC<TitleSubtitleProps> = ({
  title,
  subtitle,
  action,
  titleClassName = "",
  subtitleClassName = "",
  className = "",
}) => {
  return (
    <div className={`flex items-start justify-between gap-4 ${className}`}>
      <div className="flex flex-col">
        <h1
          className={`xl:text-3xl text-xl font-bold text-gray-800 md:mb-2 mb-1 ${titleClassName}`}
        >
          {title}
        </h1>
        <p
          className={`text-[#4B5563] md:text-base font-normal text-sm ${subtitleClassName}`}
        >
          {subtitle}
        </p>
      </div>
      {action ? <div className="ml-2">{action}</div> : null}
    </div>
  );
};

export default TitleSubtitle;
