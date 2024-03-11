import { css } from "@emotion/react";
import styled from "@emotion/styled";

const containerStyle = css({
  display: "flex",
  flex: 1,
});

const D3Container = styled("div")`
  display: flex,
  flex: 1,
`;

export default function () {
  return (
    // <div css={containerStyle}>
    //   <svg></svg>
    // </div>
    <D3Container>
        <svg></svg>
    </D3Container>
  );
}
