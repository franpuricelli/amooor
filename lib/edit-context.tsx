"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  edit-context.tsx — capa de EDICIÓN inline del preview (Phase 3).
//  El editor envuelve el árbol del sitio en <EditProvider>; los componentes de
//  sección usan <EditableText> para su copy y `useEdit()?.onPickImage(...)` en sus
//  imágenes. FUERA del editor no hay provider → `useEdit()` devuelve null y todo se
//  renderiza plano: el sitio real de un tenant NO se ve afectado.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, type ReactNode, type ElementType } from "react";

export interface EditAPI {
  /** true = modo edición activo (muestra afordancias + hace editable el copy) */
  editing: boolean;
  /** commit de un campo de texto: `path` estilo "hero.lede" o "story.historia.beats.0.title" */
  onEditText: (path: string, value: string) => void;
  /** click en una imagen del preview → abrir Multimedia en esa categoría/slug */
  onPickImage: (cat: string, slug?: string) => void;
}

const EditContext = createContext<EditAPI | null>(null);

export function EditProvider({ value, children }: { value: EditAPI; children: ReactNode }) {
  return <EditContext.Provider value={value}>{children}</EditContext.Provider>;
}

export function useEdit(): EditAPI | null {
  return useContext(EditContext);
}

/**
 * Un fragmento de copy editable. En modo edición es `contentEditable` (commit en
 * blur, no en cada tecla, así el cursor no salta) con subrayado punteado + lápiz.
 * Sin provider (sitio real) o sin `editing`, renderiza texto plano.
 */
export function EditableText({
  path,
  value,
  as,
  className,
  style,
}: {
  path: string;
  value: string;
  as?: ElementType;
  className?: string;
  style?: React.CSSProperties;
}) {
  const edit = useEdit();
  const Tag = (as ?? "span") as ElementType;

  if (!edit?.editing) {
    return (
      <Tag className={className} style={style}>
        {value}
      </Tag>
    );
  }

  return (
    <Tag
      className={`${className ?? ""} pa-editable`.trim()}
      style={style}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      data-edit-path={path}
      onClick={(e: React.MouseEvent) => e.stopPropagation()}
      onBlur={(e: React.FocusEvent<HTMLElement>) =>
        edit.onEditText(path, (e.currentTarget.textContent ?? "").trim())
      }
      onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
        // Enter confirma en campos de una línea (no en párrafos largos)
        if (e.key === "Enter" && Tag !== "p") {
          e.preventDefault();
          (e.currentTarget as HTMLElement).blur();
        }
        if (e.key === "Escape") (e.currentTarget as HTMLElement).blur();
      }}
    >
      {value}
    </Tag>
  );
}
