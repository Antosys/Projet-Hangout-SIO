

import { motion } from "framer-motion";
import { miniCardVariants } from "./heroConfig";


type MiniEventCardProps = {
  imgSrc: string;
  avatarUrls: string[];
  participants: string;
  title: string;
  info: string;
  cta: string;
  variant: "animateRight" | "animateLeft" | "static" | undefined;
  style?: React.CSSProperties;
};

const MiniEventCard = ({
  imgSrc,
  avatarUrls,
  participants,
  title,
  info,
  cta,
  variant,
  style = {},
}: MiniEventCardProps) => (
  <motion.div
    initial={variant === "animateRight" ? "initial" : variant === "animateLeft" ? "initial" : false}
    animate={variant}
    variants={miniCardVariants}
    className="absolute"
    style={style}
  >
    <div className="bg-white border border-blue-100/40 rounded-xl shadow-md px-0 pt-0 pb-2 flex flex-col gap-1 overflow-hidden relative w-[134px] h-[170px] min-h-[153px] max-h-[230px]">
      <div className="w-full h-[52px] overflow-hidden flex items-center justify-center relative">
        <img
          src={imgSrc}
          alt="Event"
          className="object-cover w-full h-full rounded-t-xl border-0"
          style={{
            objectPosition: "top",
            width: "100%",
            height: "52px",
            borderRadius: "0.75rem 0.75rem 0 0",
            boxShadow: "0 0 0 transparent"
          }}
        />
      </div>
      <div className="px-2 flex flex-col gap-1">
        <div className="flex flex-row justify-center items-center gap-1 mt-2 w-full">
          <div className="flex flex-row items-center justify-center">
            <img
              src={avatarUrls[0]}
              className="w-[18px] h-[18px] rounded-full border border-white -mr-1 z-20 object-cover aspect-square"
              alt="avatar1"
            />
            <img
              src={avatarUrls[1]}
              className="w-[18px] h-[18px] rounded-full border border-white z-10 object-cover aspect-square"
              alt="avatar2"
            />
          </div>
          <span className="text-blue-700/90 text-[10px] font-medium whitespace-nowrap bg-transparent shadow-none leading-3 ml-1">
            {participants}
          </span>
        </div>
        <h4 className="text-[11px] font-bold text-blue-900 mb-0.5 pt-2 text-center">{title}</h4>
        <div className="text-blue-900/80 text-[9px] text-center">{info}</div>
      </div>
      <div className="flex justify-center mt-2">
        <button
          type="button"
          className="w-[80%] py-1.5 rounded-xl text-[12px] font-semibold text-white shadow bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:to-blue-800 transition-all duration-150 focus:outline-none"
          style={{
            boxShadow: "0 0 0 0 rgba(50, 120, 240, 0.11)"
          }}
        >
          {cta}
        </button>
      </div>
    </div>
  </motion.div>
);

export default MiniEventCard;

