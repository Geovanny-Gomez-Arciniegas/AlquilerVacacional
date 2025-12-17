import Image from 'next/image';

interface CardInicioProps {
  title: string;
  description: string;
  image: string;
}

export function CardInicio({ title, description, image }: CardInicioProps) {
return (
  <div className="relative flex flex-col my-6 bg-white shadow-sm border border-slate-200 rounded-lg w-96">
    <div className="relative w-full aspect-4/3 overflow-hidden rounded-lg">
  <Image
    src={image}
    alt="Imagen"
    fill
    className="object-cover rounded-lg"
    priority
  />
</div>

    <div className="px-4 pt-2 pb-4">
      <div className="flex items-center mb-1">
        <h6 className="text-slate-800 text-xl font-semibold">{title}</h6>
        <div className="flex items-center gap-1 ml-auto">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5 text-blue-500"
          >
            <path
              fillRule="evenodd"
              d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-slate-600 ml-1.5">5.0</span>
        </div>
      </div>

      <p className="text-slate-600 leading-normal font-light">{description}</p>
    </div>

    {/* Botones de acción */}
    <div className="group my-3 inline-flex flex-wrap justify-center items-center gap-2">
      <button className="rounded-full border border-slate-300 py-2 px-4 text-sm text-slate-600 hover:bg-slate-800 hover:text-white transition-all">
        + 20
      </button>
    </div>

    {/* Botón Reservar */}
    <div className="px-4 pb-4 pt-0 mt-2">
      <button className="w-full rounded-md bg-blue-600 py-2 px-4 text-2xl text-white font-bold hover:bg-blue-700 transition-all">
        Reservar
      </button>
    </div>
  </div>
);

}