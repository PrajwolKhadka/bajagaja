type keyProps = {
    note: any;
    isBlack? : boolean;
    active?: boolean;
    onStart: ()=> void;
    onStop: () => void;
};

export default function key({note, isBlack, active, onStart, onStop}: keyProps){
    return(
        <button
        // onMouseDown={onStart}
        // onMouseUp={onStop}
        // onMouseLeave={onStop}
        onPointerDown={onStart}
        onPointerUp={onStop}
        onPointerLeave={onStop}
        onPointerCancel={onStop}
        className={`${isBlack?
             `w-8 h-28 bg-black text-white z-10 ${active? "bg-orange-300": "bg-black"}`
             : `w-14 h-48  text-black border flex flex-col justify-end items-center pb-2 ${active? "bg-orange-300": "bg-white"}`
        }`}
        >
            <span>{note.note}</span>
            <span className="text-xs">{note.key.toUpperCase()}</span>
        </button>
    );
}