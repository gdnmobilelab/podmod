import * as React from "react";

interface BottomSliderProps extends React.HTMLAttributes<HTMLDivElement> {
    bottomElement: JSX.Element;
    expanded: boolean;
}

interface BottomSliderState {
    bottomElementHeight?: number;
}

const bottomContainerStyles: React.CSSProperties = {
    position: "absolute",
    top: "100%",
    width: "100%",
    left: 0
};

export class BottomSlider extends React.Component<BottomSliderProps, BottomSliderState> {
    bottomElementContainer: HTMLDivElement | null;

    render() {
        let containerStyles: React.CSSProperties = {
            position: "relative",
            transform: "translate3d(0,0,0)",
            transition: "transform 0.2s linear"
        };

        if (this.props.expanded && this.state && this.state.bottomElementHeight) {
            containerStyles.transform = `translate3d(0,${-this.state.bottomElementHeight}px,0)`;
        }

        return (
            <div className={this.props.className} onClick={this.props.onClick} style={containerStyles}>
                {this.props.children}
                <div ref={el => (this.bottomElementContainer = el)} style={bottomContainerStyles}>
                    {this.props.bottomElement}
                </div>
            </div>
        );
    }

    componentWillReceiveProps(nextProps: BottomSliderProps) {
        if (nextProps.expanded && this.props.expanded === false) {
            this.setState({
                bottomElementHeight: Math.round(this.bottomElementContainer!.getBoundingClientRect().height)
            });
        }
    }
}
