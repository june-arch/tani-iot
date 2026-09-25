import { Controller, Get } from '@nestjs/common';
import { openApiDocument } from './openapi.document';

/** Mentahan spek OpenAPI (JSON) — dipakai Scalar di /api/docs & tooling codegen. */
@Controller()
export class DocsController {
  @Get('openapi.json')
  spesifikasi() {
    return openApiDocument;
  }
}
