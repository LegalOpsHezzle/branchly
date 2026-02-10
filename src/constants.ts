import { Flow } from './types';

export const SALMON_ACT_FLOW: Flow = {
  id: 'salmon-act-1986',
  title: 'Salmon Act 1986 Compliance',
  description: 'Guide for handling salmon in suspicious circumstances.',
  startNodeId: 'node-1',
  nodes: [
    {
      id: 'node-1',
      type: 'decision',
      position: { x: 500, y: 50 },
      content: {
        title: 'Are you handling a salmon right now?',
        bodyText: 'This short guide helps you understand whether your current interaction with a salmon could raise issues under Section 32 of the Salmon Act 1986.\n\nSection 32 applies only if you are handling or in possession of salmon.',
      },
      options: [
        { id: 'opt-1-1', label: 'Yes - I have or am handling a salmon', targetNodeId: 'node-2', isExternalLink: false },
        { id: 'opt-1-2', label: 'No - I am just going about my day', targetNodeId: 'node-no-salmon', isExternalLink: false }
      ]
    },
    {
      id: 'node-no-salmon',
      type: 'information',
      position: { x: 800, y: 250 },
      content: {
        title: 'No issue identified',
        bodyText: 'If you are not handling or possessing salmon, Section 32 does not apply. You are free to continue minding your own business.',
      },
      options: [
        { id: 'opt-no-1', label: 'Start Over', targetNodeId: 'node-1', isExternalLink: false }
      ]
    },
    {
      id: 'node-2',
      type: 'decision',
      position: { x: 200, y: 250 },
      content: {
        title: 'Where did the salmon come from?',
        bodyText: 'The legality depends on how the salmon was obtained and whether its origin appears legitimate.',
      },
      options: [
        { id: 'opt-2-1', label: 'Purchased from a licensed fishmonger or retailer', targetNodeId: 'node-safe', isExternalLink: false },
        { id: 'opt-2-2', label: 'I caught it myself', targetNodeId: 'node-catch', isExternalLink: false },
        { id: 'opt-2-3', label: 'Obtained from an unclear or suspicious source', targetNodeId: 'node-risk', isExternalLink: false }
      ]
    },
    {
      id: 'node-safe',
      type: 'information',
      position: { x: 50, y: 500 },
      content: {
        title: 'Compliant - legitimate source',
        bodyText: 'Salmon purchased from a licensed retailer or caught personally with a valid licence is generally not considered suspicious. Based on what you have said, no issue is apparent under Section 32.',
      },
      options: []
    },
    {
      id: 'node-risk',
      type: 'decision',
      position: { x: 350, y: 500 },
      content: {
        title: 'Do you believe the salmon may have been taken unlawfully?',
        bodyText: 'An offence can arise if you believe, or it would be reasonable to believe, that the salmon was illegally obtained.',
      },
      options: [
        { id: 'opt-risk-1', label: 'Yes - I suspect it may be illegal', targetNodeId: 'node-illegal', isExternalLink: false },
        { id: 'opt-risk-2', label: 'No - but I cannot be completely sure', targetNodeId: 'node-doubt', isExternalLink: false }
      ]
    },
    {
      id: 'node-catch',
      type: 'decision',
      position: { x: 650, y: 500 },
      content: {
        title: 'Do you hold a valid rod licence?',
        bodyText: 'Handling salmon you caught yourself is only lawful if it was taken in accordance with licensing and fishing regulations.',
      },
      options: [
        { id: 'opt-catch-1', label: 'Yes - I have a valid rod licence', targetNodeId: 'node-safe', isExternalLink: false },
        { id: 'opt-catch-2', label: 'No - I do not have one', targetNodeId: 'node-help-links', isExternalLink: false },
        { id: 'opt-catch-3', label: 'I am not sure', targetNodeId: 'node-help-links', isExternalLink: false }
      ]
    },
    {
      id: 'node-illegal',
      type: 'information',
      position: { x: 200, y: 750 },
      content: {
        title: 'High risk - suspicious circumstances',
        bodyText: 'You may be in breach of Section 32 of the Salmon Act 1986. Handling salmon where you know or reasonably believe it was illegally taken is an offence and may carry criminal penalties.',
      },
      options: []
    },
    {
      id: 'node-doubt',
      type: 'information',
      position: { x: 500, y: 750 },
      content: {
        title: 'At risk - further checks required',
        bodyText: 'Even without actual knowledge, the law applies a reasonable belief standard. If the circumstances are suspicious, you should verify the salmon origin immediately.',
      },
      options: []
    },
    {
      id: 'node-help-links',
      type: 'information',
      position: { x: 800, y: 750 },
      content: {
        title: 'At risk - licensing issue',
        bodyText: 'Handling salmon without a valid licence may be unlawful. If you are unsure, you should verify your licensing status before proceeding.',
      },
      options: [
        { id: 'opt-help-1', label: 'Go to GOV.UK Fishing Licenses', targetNodeId: null, isExternalLink: true, externalUrl: 'https://www.gov.uk/fishing-licences' },
        { id: 'opt-help-2', label: 'Back to Start', targetNodeId: 'node-1', isExternalLink: false }
      ]
    }
  ]
};

export const GIFT_REGISTER_FLOW: Flow = {
  id: 'gift-register',
  title: 'Gift Register and Compliance',
  description: 'Guidance on when to record gifts and hospitality.',
  startNodeId: 'gift-node-1',
  nodes: [
    {
      id: 'gift-node-1',
      type: 'information',
      position: { x: 0, y: 0 },
      content: {
        title: 'Gift Register Policy',
        bodyText: 'This tool helps you determine if a gift or hospitality you have received must be recorded on the internal Gift Register according to our corporate compliance policy.',
      },
      options: [
        { id: 'gift-opt-1-1', label: 'Start Assessment', targetNodeId: 'gift-node-2', isExternalLink: false }
      ]
    },
    {
      id: 'gift-node-2',
      type: 'decision',
      position: { x: 0, y: 0 },
      content: {
        title: 'Threshold Check',
        bodyText: 'Is the estimated value of the gift or hospitality over 100 GBP?',
      },
      options: [
        { id: 'gift-opt-2-1', label: 'Yes, it is over 100 GBP', targetNodeId: 'gift-node-3', isExternalLink: false },
        { id: 'gift-opt-2-2', label: 'No, it is 100 GBP or under', targetNodeId: 'gift-node-4', isExternalLink: false }
      ]
    },
    {
      id: 'gift-node-3',
      type: 'information',
      position: { x: 0, y: 0 },
      content: {
        title: 'Registration Required',
        bodyText: 'Gifts over 100 GBP must be recorded on the Intranet Gift Register within 7 days of receipt to ensure transparency and avoid conflicts of interest.',
      },
      options: [
        { id: 'gift-opt-3-1', label: 'Open Gift Register (Intranet)', targetNodeId: null, isExternalLink: true, externalUrl: 'https://intranet.example/gift-register' }
      ]
    },
    {
      id: 'gift-node-4',
      type: 'information',
      position: { x: 0, y: 0 },
      content: {
        title: 'No Registration Required',
        bodyText: 'Gifts under 100 GBP generally do not need to be registered. However, always ensure the gift is appropriate and does not create a conflict of interest. If offered by a vendor currently in a tender process, you must decline regardless of value.',
      },
      options: []
    }
  ]
};
