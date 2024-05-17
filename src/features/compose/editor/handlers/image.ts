import { $createImageNode } from '../nodes/image-node';

import type { ImportHandler } from '@mkljczk/lexical-remark';

const importImage: ImportHandler<any> /* TODO */ = (node, parser) => {
  const lexicalNode = $createImageNode({ altText: node.alt ?? '', src: node.url });
  parser.append(lexicalNode);
};

export { importImage };
