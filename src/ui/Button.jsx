// REACT //
import React from "react";

// MODULES //
import { useNavigate } from "react-router-dom";

// OTHERS //
import PropTypes from "prop-types";

export default function Button({ data }) {
  const navigate = useNavigate();

  const {
    text,
    link,
    target = "_blank",
    onClick, // optional function
  } = data;

  const handleClick = (e) => {
    // 1) if onClick exists, execute it
    if (typeof onClick === "function") {
      onClick(e);
      return;
    }

    // 2) else, handle link navigation
    if (!link) return;

    if (link.startsWith("/")) {
      navigate(link);
    } else {
      window.open(link, target);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="cursor-pointer rounded-2xl bg-n-primary px-5 py-5 md:px-6 md:py-3.5 lg:gap-2 lg:px-7 lg:py-4"
    >
      <p className="text-sm font-medium text-primary-foreground">{text}</p>
    </button>
  );
}

Button.propTypes = {
  data: PropTypes.shape({
    text: PropTypes.string.isRequired,

    // optional link navigation
    link: PropTypes.string,
    target: PropTypes.oneOf(["_self", "_blank"]),

    // optional click function
    onClick: PropTypes.func,
  }).isRequired,
};
