import * as React from "react";

interface TimeFormatterProps extends React.HTMLAttributes<HTMLSpanElement> {
    time?: number;
}

function numberToPaddedString(number: number) {
    if (number < 10) {
        return "0" + String(number);
    }
    return String(number);
}

export function TimeFormatter(props: TimeFormatterProps) {
    let { time, ...remainingProps } = props;

    if (time === undefined || time < 0) {
        return <span {...remainingProps}>--:--</span>;
    }

    let roundedTime = Math.floor(time);
    let seconds = roundedTime % 60;
    let minutes = (roundedTime - seconds) / 60;

    return (
        <span {...remainingProps}>
            {numberToPaddedString(minutes)}:{numberToPaddedString(seconds)}
        </span>
    );
}
