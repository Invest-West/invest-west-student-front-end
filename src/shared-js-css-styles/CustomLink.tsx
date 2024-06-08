import React from "react";
import {NavLink} from "react-router-dom";
import {css, StyleSheet} from "aphrodite";

export interface CustomLinkProps {
    url: string;
    target?: string;
    color: string | "none";
    activeColor: string | "none";
    activeUnderline: boolean;
    component: "a" | "nav-link";
    childComponent: React.ReactNode;
}

const CustomLink = (props: CustomLinkProps) => {
    if (props.component === "a") {
        return <a
            href={props.url}
            target={props.target}
            className={css(styles(props).link_style)}
        >
            {props.childComponent}
        </a>;
    }

    return <NavLink
        to={props.url}
        target={props.target}
        className={css(styles(props).link_style)}
    >
        {props.childComponent}
    </NavLink>;
}

export default CustomLink;

const styles = (props: CustomLinkProps) => StyleSheet.create({
    link_style: {
        color: props.color,
        ':hover': {
            color: props.activeColor,
            textDecoration: props.activeUnderline ? "underline" : "none"
        }
    }
});