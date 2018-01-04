import { ScriptMetadata, makeRelative } from "../../interfaces/script";
import * as styles from "./header.css";
import * as React from "react";

interface HeaderProperties {
    metadata?: ScriptMetadata;
    relativeTo: string;
}

export function Header(props: HeaderProperties) {
    // Get rid of this until we have a design.
    return null;

    // if (!props.metadata) {
    //     return null;
    // }

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
