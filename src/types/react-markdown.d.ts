declare module "react-markdown" {
  import * as React from "react";

  export interface ReactMarkdownOptions {
    children?: string;
    components?: Record<string, React.ComponentType<any>>;
  }

  export default function ReactMarkdown(props: ReactMarkdownOptions): React.ReactElement;
}
