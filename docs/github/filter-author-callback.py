# Radiance — Git Filter-Repo Author Correction Callback Script
# Target: Correct exactly 60 commits on main from engineering@radiance.ai to tanishbane99@gmail.com
# PREPARATION ONLY — DO NOT EXECUTE WITHOUT EXPLICIT USER AUTHORIZATION

import sys

try:
    import git_filter_repo
except ImportError:
    print("Error: git_filter_repo Python module is not installed.", file=sys.stderr)
    print("Install via: py -3 -m pip install git-filter-repo", file=sys.stderr)
    sys.exit(1)

# Strictly bounded allowlist of the 60 exact commit SHAs
AUTHORIZED_60_COMMITS = {
    b"42c8c37c7fd7f270af5e54e37fc5d3df12da3f07",  # [42c8c37] chore(baseline): initial legacy Tanix AI codebase with engineering audit
    b"e8adc7e2f647653fafdf713f8ee79d3bfbe0684f",  # [e8adc7e] feat(radiance): complete platform transformation to Next.js 15, Vercel AI SDK, React 19, and TypeScript
    b"f43e2c7b4fabad530d09f7d576f460264a8294e7",  # [f43e2c7] fix(vercel): configure framework as nextjs and provide public directory
    b"54315f668d88efc87c7162a5d23f568cefdb6c7f",  # [54315f6] feat(remediation): complete corrective engineering, AI infrastructure upgrade, and production readiness
    b"07f451466cc8007b587ff6b4d84338cf556fbcdf",  # [07f4514] feat(ui): implement 21st.dev animated bloom & waves gradients across 12 themes and integrate Aceternity sidebar
    b"bc52d9a952c4d8c32fb8b7a03a0b3ddd42d50323",  # [bc52d9a] feat(theme): implement signature 3-stop chromatic text gradient and Cormorant Garamond typography
    b"e7bd50aa9ec4516db77f36a50f7facab95630b4e",  # [e7bd50a] feat(ux): comprehensive UI/UX overhaul across design system, accessibility, typography, and test coverage
    b"be7af5b6b13ddf3143eb2e71ca9e065c903c0dc6",  # [be7af5b] feat(theme): add 28 color palettes across 5 categories and 13 atmosphere background engines
    b"231d4dee9be7dda4e2b94c8f76a2fe65acfb0d7f",  # [231d4de] feat(navigation): fix navigation bar overlap and remove persona modes
    b"dff482c48257e76145fdde0d3a4381fc1314d00e",  # [dff482c] feat(navigation): completely remove legacy import feature and dialog
    b"e2ab1206574d2557e0e0d8d4b797e7d1366c8c96",  # [e2ab120] Fix navigation overlap, remove persona UI, apply sticky header
    b"ce707133244c233c4c2ee9074d249979f52f2e87",  # [ce70713] Restore Personalization in sidebar and refine drawer for themes and engines
    b"5491fe765128df764ede118dd5de6cdce4b1b48e",  # [5491fe7] Refine background atmosphere, typography, and component restraint per design review
    b"1d260879c1631f86d6256fcdac4ba3f798ad4a63",  # [1d26087] feat(composer-markdown): integrate rich prompt composer, KaTeX mathematics, and enhanced code blocks
    b"3b71be5a1a6dbacc4dff1b391f42204c69f35834",  # [3b71be5] feat(ui): add Radiance motion and responsive refinements
    b"169f47cbcdc2d81c4f36ce733cf26755049eed14",  # [169f47c] fix(composer): completely remove Upgrade to Pro banner and modal
    b"0e67874d2544b44fa7574694435aecb229d6bb71",  # [0e67874] feat(composer): replace demo models with real Radiance model selector per design spec
    b"2ef42d72aa370441a2a450e50dcd9e9c2394d0c4",  # [2ef42d7] refactor(topbar): remove model selector from topbar so it lives exclusively in chat composer
    b"5ae4954aee029f660b57c3df63f1e4a1e9eb187b",  # [5ae4954] feat(theme): implement dynamic automatic color theme assignment on site visit
    b"1d5eea81440e73e2c0d5cf1d8c634121b6cde261",  # [1d5eea8] feat(ui): redesign suggested prompts to 3-column Understand/Create/Explore layout matching Image 2
    b"9a36e7aba9358b5b43342bdf98d5f701faeecd6c",  # [9a36e7a] feat(ui): automatically harmonize suggestions interface with background theme and active palette
    b"d8c4284cf72f19a51a50af51d7371a99a4ebf742",  # [d8c4284] feat(brand): integrate official geometric striped speed symbol and brand asset system (RADIANCE-BRAND-001)
    b"d1e4942d075f54f43d0645dc385d42de770a2d56",  # [d1e4942] feat(security,quality): comprehensive security audit remediation and codebase hardening
    b"049c2ad9f73d2586ecbfaf5403eeaa3a21d377c6",  # [049c2ad] refactor(compression): compress codebase with ponytail, remove redundant passthroughs and hoist lookup maps
    b"0733e810ac659dc864921d2f821beadcbce75144",  # [0733e81] refactor(compression): apply deep ponytail line-by-line compression across UI and format components
    b"5acc39b654ca46a8520370b9452017ff99d6c560",  # [5acc39b] fix(ci): eliminate invalid npmrc causing action-setup crash
    b"024aebd641e15c69cb58c1176d0aea1329509833",  # [024aebd] feat(theme): upgrade atmosphere engines with 21st.dev anti-slop options
    b"5d634c1e7a2733d0b724dc65cc38218ee7a05152",  # [5d634c1] feat(theme): elevate atmosphere engines to gallery-grade Retina 21st.dev models
    b"881c344f1cd5da145213f6f139c4e3f4918ab690",  # [881c344] feat(atmosphere): replace deprecated background themes with 5 new 21st.dev flagship generative engines
    b"9045596d70d59366f65cd8e5c0e640e06cd55c1b",  # [9045596] feat(responsive): 100% mobile ergonomics, touch events, safe-area insets, and cross-browser resilience
    b"a4c74e4474f2a60c5354a5b0a8d26d06fced415c",  # [a4c74e4] Merge origin/main into feature/radiance-platform-transformation (resolve settings-drawer icon map conflict)
    b"d8b92880a854059f66c45f8920dd4b73600cd63a",  # [d8b9288] feat(mobile): comprehensive mobile optimization, touch ergonomics, iOS zoom prevention, and cross-resolution resilience
    b"b6cb2eddfbb62c224d54f81352c29cf4a58cb088",  # [b6cb2ed] fix(audit): comprehensive remediation of ponytail-audit findings
    b"42372be251c88a30152d552d0dd9a39712c920c4",  # [42372be] feat(theme): replace ambient sunlight with professional cinematic studio theme
    b"72533d6d767ebe19dceb2d0c2f41edd970477715",  # [72533d6] fix(audit): comprehensive remediation of test gaps, bundle optimization, and CI integration
    b"62f890792778ff7e5e2e6e3e087281615c107cef",  # [62f8907] feat(design): complete new cinematic studio design system and welcome card architecture
    b"23d57eab5f9052cd3e4dbf372dd5809d6b8c8e10",  # [23d57ea] feat(theme): replace cinematic theme with clean, anti-slop aurora nights atmospheric engine
    b"5b8119b22bb01d3b4f4b686bab197280a0864936",  # [5b8119b] feat(theme): replace aurora nights with solid plain black background and plain white option
    b"3e16c8196f3fb7d2d5ee8dc9deb9530cdba3e9cf",  # [3e16c81] feat(theme): complete black-and-white high-contrast theme, 100% element & mobile touch optimization
    b"19d7802f3c59e42c80f933aa66e1b9588280391f",  # [19d7802] refactor(ui): unslop interface with quiet chrome, editorial typography, and clean line icons
    b"f77a888fac98be7d7f417f93850c23179abfe475",  # [f77a888] refactor(ui): unslop micro-labels, audio active ring, and calm typography
    b"2ade78e704f284764f463cf2d93a78718f9a927d",  # [2ade78e] revert: restore exact Radiance visual identity, welcome architecture, 13 atmospheric engines, and 28 color palettes
    b"7817c2e5d38327b7cb34d7f3d24e20174afd0d6c",  # [7817c2e] refactor(ui): unslop interface with quiet chrome, editorial typography, and clean line icons
    b"cadae572acc9de03881f371cb0186c904c11f46a",  # [cadae57] Revert "refactor(ui): unslop interface with quiet chrome, editorial typography, and clean line icons"
    b"3e9908d5bceb578b009d25e1bc2fc6be036e307e",  # [3e9908d] feat(ui): redesign personalization drawer, typography system, and motion interactions
    b"1ab420b436e4cdcd8e35838fed3e9d84371c2a2e",  # [1ab420b] feat(theme): remove cinematic atmosphere and replace fluid aurora with prismatic caustics engine
    b"c92555ea33d45e65ef44fdb1e45115952884a1b2",  # [c92555e] feat(theme): replace prismatic caustics with silk ribbons atmosphere engine
    b"a16b072289e17c46bd6fc82ee837d2744e344895",  # [a16b072] feat(chat): redesign composer dock with luminous glassmorphism, refined typography, and spring motion
    b"ab3efd4e436d9fa71a94bdffc390d0faeb3c1c22",  # [ab3efd4] feat(chat): complete theme glassmorphism, professional icons, and remove hint footer
    b"1fc84d701f1e522a80947451bf131612f96e3846",  # [1fc84d7] fix(composer): resolve popover clipping and overlapping by removing overflow-hidden and anchoring upward menus
    b"70ba19c12e4ab13a5d298724f0c475782bc87052",  # [70ba19c] feat(security): comprehensive security audit remediation and defensive hardening
    b"e3351a0746487f2b330d64e01c6384241291edcd",  # [e3351a0] feat(ui): redesign sidebar dock with luminous theme glassmorphism, spring physics, and refined typography
    b"924aa2ccd2e9e3a631e3f2cfcabeff8a102da6f9",  # [924aa2c] fix(sidebar): eliminate double-circle overlapping glitch and unify 40px collapsed dock alignment
    b"7f0256d412e5a589a2bbb2bddd565d573951fdd2",  # [7f0256d] feat(mobile): implement mobile-first touch ergonomics, thumb-zone bottom navigation, and WebGL LOD
    b"c546dfaa2614f049e5ca0c4ecaf9dc57d895cef6",  # [c546dfa] feat(repo): dynamic GitHub README, technical documentation hub, SEO, and community governance
    b"5696003f1580042c05eb1bb1c85e0599b46126e0",  # [5696003] feat(settings): add Radiance Settings Center
    b"a84d650ed66907ea5cf9ed1e0d1a1c08b8050f6d",  # [a84d650] feat: add local personal intelligence engine
    b"cd4bf097f450a1e8c2e81eedf0190764c7d8180a",  # [cd4bf09] feat: add Radiance landing page
    b"18e6fbf1e3da8dd48a203af4ad25f4d754e8e558",  # [18e6fbf] feat(home): redesign Radiance homepage
    b"fd0deef342a7743fd7f55bda8af20a492c24541e",  # [fd0deef] feat(home): add premium Radiance landing experience
}

def commit_callback(commit, callback_metadata):
    # Condition 1: Must be in the authorized 60-commit allowlist
    if commit.original_id in AUTHORIZED_60_COMMITS:
        # Condition 2: Must match the expected old author identity
        if commit.author_email == b"engineering@radiance.ai":
            commit.author_name = b"TanishBane"
            commit.author_email = b"tanishbane99@gmail.com"
            # Committer, timestamps, message, and tree are left UNTOUCHED

if __name__ == '__main__':
    args = git_filter_repo.FilteringOptions.parse_args([
        '--force',
        '--refs', 'main'
    ])
    filter_instance = git_filter_repo.RepoFilter(args, commit_callback=commit_callback)
    filter_instance.run()
