/*type ButtonProps = {
    children?: string;
}*/

import { useState } from "react";

export function Button() {
//    let counter = 0;

    const [counter, setCounter] = useState(0)

    function increment(){
        setCounter(counter + 1);
    }

    return (
        <button onClick={increment}>{counter}</button>
    )
}

// export default Button;
// text?: A interrogação significa que o texto será opicional. 
// props.text || 'Default' -> Uso a propriedade text, e caso o texto não seja preenchido, usaremos o default.