import { ScriptMetadata, makeRelative } from "../../interfaces/script";
import * as styles from "./header.css";
import * as React from "react";

interface HeaderProperties {
    metadata?: ScriptMetadata;
    showExpanded: boolean;
}

export function Header(props: HeaderProperties) {
    if (!props.metadata) {
        return null;
    }

    let expandedClassName = styles.expandedHeader;
    if (props.showExpanded) {
        expandedClassName += " " + styles.showExpandedHeader;
    }

    return (
        <div className={styles.header}>
            <div className={expandedClassName}>
                <div className={styles.strangeBirdTitle + " " + styles.expandedTitle}>
                    {props.metadata.title}
                </div>
                <p>{props.metadata.description}</p>
            </div>
            <h1 className={styles.strangeBirdTitle}>{props.metadata.title}</h1>
        </div>
    );

    // let imgUrl = makeRelative(props.metadata.avatarFile, props.relativeTo);

    // return (
    //     <div className={styles.header}>
    //         {/* <div className={styles.headerBackground} /> */}
    //         <div>
    //             <img src={imgUrl} className={styles.headerAvatar} />
    //         </div>
    //         <div className={styles.headerTextContainer}>
    //             <h1>{props.metadata.title}</h1>
    //             <p>{props.metadata.description}</p>
    //         </div>
    //     </div>
    // );
}
