import { useRef, useState } from 'react'

// TODO(legal): placeholder copy only — swap for ATOOPV's real, lawyer-approved
// Terms & Conditions / Privacy Policy text before this ever reaches production.
// Structure (articles + annexes) is kept generic on purpose so the real text
// can drop straight in without reshaping this component.
const PLACEHOLDER_TERMS = `
CONDITIONS GÉNÉRALES D'UTILISATION — TEXTE PROVISOIRE
Version de démonstration — à remplacer par le texte définitif validé par ATOOPV.

Article 1 – Éditeur et hébergeur
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Article 2 – Objet et documents contractuels
Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Article 3 – Acceptation et modification
Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

Article 4 – Accès au service et comptes
Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.

Article 5 – Utilisations interdites
Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur. Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse.

Article 6 – Contenus de l'Utilisateur
At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.

Article 7 – Nature du service et intelligence artificielle
Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio nam libero tempore, cum soluta nobis est eligendi.

Article 8 – Disponibilité
Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae itaque earum rerum hic tenetur a sapiente delectus.

Article 9 – Données personnelles
Ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.

Article 10 – Propriété intellectuelle
Et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum.

Article 11 – Responsabilité
Dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum sed ut perspiciatis unde omnis iste natus error sit voluptatem.

Article 12 – Droit applicable et litiges
Accusantium doloremque laudantium totam rem aperiam eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo nemo enim ipsam voluptatem quia voluptas sit aspernatur.

Fin du texte provisoire — vous avez atteint la fin du document.
`.trim()

const NEAR_BOTTOM_PX = 4

/**
 * The scroll-gated Terms & Conditions acceptance control used on the Company
 * registration form. Matches the reference pattern (a third-party SaaS
 * competitor's company-registration page): the agreement sits in its own
 * fixed-height scrollable box; the checkbox below it is read-only — a click
 * on it does nothing — and only ticks itself once the box has been scrolled
 * all the way to its end. The parent gates its submit button on `accepted`.
 */
export default function TermsAcceptance({ onAccept }) {
  const [reachedEnd, setReachedEnd] = useState(false)
  const boxRef = useRef(null)

  const handleScroll = () => {
    if (reachedEnd) return // one-way: once accepted, scrolling back up must not un-accept it
    const el = boxRef.current
    if (!el) return
    const atEnd = el.scrollHeight - el.scrollTop - el.clientHeight <= NEAR_BOTTOM_PX
    if (atEnd) {
      setReachedEnd(true)
      onAccept(true)
    }
  }

  return (
    <div className="rounded-2xl border border-ink/12 bg-paper/60 p-4">
      <p className="text-sm font-medium text-ink">Terms &amp; Conditions &amp; Privacy Policy</p>
      <p className="mt-1 text-xs text-muted">
        Please read the policy and scroll to the end to enable the Continue button.
      </p>

      <div
        ref={boxRef}
        onScroll={handleScroll}
        className="mt-3 h-48 overflow-y-scroll whitespace-pre-line rounded-xl border border-ink/10 bg-card px-4 py-3 text-xs leading-relaxed text-muted"
      >
        {PLACEHOLDER_TERMS}
      </div>

      <label className="mt-3 flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={reachedEnd}
          readOnly
          aria-readonly="true"
          aria-label="I have read and accepted the Terms &amp; Conditions"
          className="h-4 w-4 accent-accent"
        />
        I have read and accepted the Terms &amp; Conditions
      </label>
    </div>
  )
}
