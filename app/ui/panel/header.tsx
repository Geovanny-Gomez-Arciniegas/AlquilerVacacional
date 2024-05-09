import Image from "next/image";
import playa from "../../../public/playa.jpg"; // se importa la imagen de playa desde public

// Este componente devuelve el header de la pagina principal
export default function Header() {
  return (
    <Image
      src={playa}
      alt={"Playa Santa Marta"}
      priority={true}
      style={{
        maxWidth: "100%",
        height: "auto",
        objectFit: "cover",        
      }}
    />
  );
}