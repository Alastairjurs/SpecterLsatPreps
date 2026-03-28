import { useState, useEffect } from "react";
import { ChevronRight, CheckCircle, XCircle, RotateCcw, BookOpen, Brain, List, Lock, Crown, User, Mail, LogIn, UserPlus, LogOut } from "lucide-react";

// localStorage storage shim (replaces window.storage for real-world deployment)
const ls = {
  get: (key) => new Promise((resolve) => {
    try {
      const val = localStorage.getItem(key);
      resolve(val ? { value: val } : null);
    } catch(e) { resolve(null); }
  }),
  set: (key, value) => new Promise((resolve) => {
    try { localStorage.setItem(key, value); resolve(true); } catch(e) { resolve(null); }
  }),
  delete: (key) => new Promise((resolve) => {
    try { localStorage.removeItem(key); resolve(true); } catch(e) { resolve(null); }
  }),
};

const LR_TEMPLATES = [
  { passage: "A recent study found that people who drink coffee daily are less likely to develop Parkinson's disease. Therefore, drinking coffee prevents Parkinson's disease.", question: "Which of the following identifies a flaw in the reasoning above?", options: ["It assumes correlation implies causation","It relies on an outdated study","It ignores alternative explanations","It overgeneralizes from a small sample","It confuses necessary and sufficient conditions"], correct: 0 },
  { passage: "Survey results show that people who exercise regularly report higher life satisfaction. Therefore, exercise causes happiness.", question: "The argument is most vulnerable to which criticism?", options: ["The sample size may be too small","It assumes correlation implies causation","It relies on self-reported data","The time period may not be representative","It fails to consider the cost of exercise"], correct: 1 },
  { passage: "Cities with more police officers have higher crime rates. Therefore, increasing police presence causes more crime.", question: "Which of the following, if true, most weakens the argument?", options: ["Cities with high crime rates hire more police in response to existing crime","Police officers receive more training in high-crime cities","Crime rates vary across neighborhoods","Most crimes go unreported","Police budgets are determined by tax revenue"], correct: 0 },
  { passage: "Manager: Employees who work from home are 15% more productive. Therefore, we should allow all employees to work remotely.", question: "The argument's conclusion follows logically if which assumption is made?", options: ["Remote work will increase productivity for all employees equally","The productivity gains outweigh any drawbacks","Office-based employees prefer working from home","The 15% figure is based on reliable data","Remote work technology is affordable"], correct: 0 },
  { passage: "Researcher: Children who read frequently perform better academically. Therefore, parents should encourage reading.", question: "Which of the following would most strengthen the argument?", options: ["Evidence that reading causes better academic performance","Studies showing academic performance is largely inherited","Data indicating most parents already encourage reading","Research on the types of books children prefer","Analysis of school library budgets"], correct: 0 },
  { passage: "All successful entrepreneurs take risks. Maria is a successful entrepreneur. Therefore, Maria takes risks.", question: "Which of the following most closely parallels the reasoning above?", options: ["All birds have feathers. Penguins are birds. Therefore, penguins have feathers.","Most doctors are well-educated. Sarah is well-educated. Therefore, Sarah is a doctor.","All plants need water. This organism needs water. Therefore, this is a plant.","Some athletes are vegetarians. John is an athlete. Therefore, John is a vegetarian.","No reptiles are mammals. Snakes are reptiles. Therefore, snakes are not mammals."], correct: 0 },
  { passage: "Either we raise taxes or the quality of education will decline. We have not raised taxes. Therefore, education quality will decline.", question: "The argument above is most vulnerable to which criticism?", options: ["It presents only two options when other alternatives may exist","It draws a conclusion broader than the evidence supports","It relies on a contradictory premise","It treats correlation as evidence of causation","It assumes what is true generally is true in this case"], correct: 0 },
  { passage: "No drug approved by the FDA has been shown to be completely without side effects. Compound X is FDA-approved. Therefore, Compound X has some side effects.", question: "The reasoning above most closely follows which pattern?", options: ["Applying a general rule to a specific case to draw a conclusion","Identifying a causal link between two observed phenomena","Drawing an analogy between two similar situations","Eliminating alternatives to arrive at the most likely cause","Appealing to expert consensus to establish a claim"], correct: 0 },
  { passage: "Some critics argue that social media harms democracy. But these critics use social media themselves. Therefore, their argument should be dismissed.", question: "The reasoning in the argument is flawed because it", options: ["Attacks the source of the argument rather than addressing its merits","Draws a sweeping conclusion from a single example","Assumes financial relationships produce false conclusions","Treats correlation as proof of causation","Relies on the opinions of non-experts"], correct: 0 },
  { passage: "Scientist: We cannot conclude this treatment is safe simply because no adverse effects have been reported. The absence of evidence is not evidence of absence.", question: "The statement above illustrates which logical principle?", options: ["Failure to find evidence for a claim does not establish the claim is false","Expert conclusions must always be verified by independent research","Causal claims require stronger evidence than correlational ones","Historical evidence is less reliable than contemporary data","Absence of a confounding variable strengthens a causal argument"], correct: 0 },
  { passage: "Every innovation that transformed society was initially dismissed by experts. Therefore, if experts dismiss an idea, it is likely to transform society.", question: "The argument above is most vulnerable to which criticism?", options: ["It draws a causal conclusion from a selected set of examples","It appeals to authority without establishing credibility","It assumes what is true of parts is true of the whole","It presents a false dilemma","It uses emotional language to substitute for logical reasoning"], correct: 0 },
  { passage: "City Council: We should not build the new highway. Every time a highway has been built near residential areas in our state, property values have decreased.", question: "Which of the following, if true, most weakens the argument?", options: ["The areas where values decreased differed in important ways from the current location","Highway construction costs have increased significantly","Property values fluctuate based on many unrelated factors","The council has previously approved highway projects","Traffic in the area has increased over the past decade"], correct: 0 },
  { passage: "Columnist: Violent crime in Millbrook has fallen every year since the community center opened. Clearly, the community center is responsible for the drop in crime.", question: "Which most accurately describes the error in the argument?", options: ["It infers a causal connection from a mere sequence of events","It draws a conclusion that goes beyond the evidence","It assumes what is true of the whole is true of its parts","It relies on biased testimony","It mistakes a necessary condition for a sufficient one"], correct: 0 },
  { passage: "No one who has won a Nobel Prize regrets the years of sacrifice required. Dr. Patel has won a Nobel Prize. Therefore, Dr. Patel does not regret the years of sacrifice.", question: "The argument above is flawed because it", options: ["Treats a sufficient condition as if it were a necessary condition","Fails to consider that the conclusion may be false even if premises are true","Relies on a premise unsupported by evidence","Confuses the meaning of two related but distinct terms","Draws a conclusion broader than the evidence warrants"], correct: 0 },
  { passage: "If the city increases park funding, residents will exercise more. If residents exercise more, healthcare costs will fall. The city increased park funding. Therefore, healthcare costs will fall.", question: "The argument above relies on which reasoning pattern?", options: ["A chain of conditional statements leading to a final conclusion","An analogy between two situations that are not sufficiently similar","An appeal to authority that does not establish the truth of the conclusion","A generalization from a single case to all cases","A circular argument in which the conclusion restates a premise"], correct: 0 },
  { passage: "Most great novelists of the twentieth century were heavy readers in their youth. James is a great twentieth-century novelist. So James was probably a heavy reader in his youth.", question: "The reasoning above is most similar to which of the following?", options: ["Most championship coaches played professional sports. Harris is a championship coach. So Harris probably played professionally.","All championship coaches played professionally. Harris is a coach. So Harris played professionally.","Some coaches played professionally. Harris played professionally. So Harris is probably a coach.","No coach who never played professionally won a championship. Harris won one. So Harris played professionally.","Most coaches who played professionally win championships. Harris played professionally. So Harris will probably win."], correct: 0 },
  { passage: "Editorial: The city should not fund the new arts center. Public money should only be spent on essential services, and the arts are not essential.", question: "The argument above depends on which assumption?", options: ["The criterion used to evaluate spending is the correct one to apply here","The arts have never provided any benefit to the public","Other similar activities have already received sufficient funding","The costs of the activity outweigh any potential benefits","Decision-makers have accurately assessed the available alternatives"], correct: 0 },
  { passage: "The board increased executive salaries by 40 percent, citing the need to attract top talent. However, employee morale surveys show a significant drop in satisfaction. Therefore, the salary increase has harmed the company.", question: "The reasoning is most vulnerable to which criticism?", options: ["It concludes a policy failed without ruling out that outcomes would have been worse without it","It relies on anecdotal evidence rather than systematic data","It appeals to authority without examining credentials","It assumes the stated goal was the only goal of the policy","It confuses a necessary condition with a sufficient one"], correct: 0 },
  { passage: "Most self-made billionaires dropped out of college. Therefore, dropping out of college increases one's chances of becoming a billionaire.", question: "The argument above is most vulnerable to which criticism?", options: ["It draws a broad causal conclusion from a selected or biased set of examples","It appeals to authority without establishing credibility","It assumes two events together means one caused the other","It presents a false dilemma by ignoring other possible outcomes","It uses emotionally charged language to substitute for logical reasoning"], correct: 0 },
  { passage: "Professor Lin argues that social media increases political polarization. But Professor Lin receives funding from a traditional media company. Therefore, her findings are biased.", question: "The argument is flawed because it", options: ["Dismisses a claim based on the source's potential bias without addressing its actual merits","Draws sweeping conclusions from a single isolated example","Assumes financial relationships always result in false conclusions","Treats correlation between funding and conclusions as proof of causation","Relies on non-experts to evaluate technical claims"], correct: 0 },
  { passage: "If an employee receives regular feedback, their performance improves. If performance improves, promotion rates increase. This department gives regular feedback. Therefore, promotion rates will increase.", question: "The argument's conclusion is properly drawn if which of the following is also assumed?", options: ["The conditional relationships described hold true in this department's case","Other departments do not also provide regular feedback","Promotion rates are the most important measure of department success","The feedback given is exclusively positive in nature","Employees in this department prefer feedback to autonomy"], correct: 0 },
  { passage: "People should not be criticized for acting in their own self-interest. Corporations are, legally speaking, persons. Therefore, corporations should not be criticized for acting in their own self-interest.", question: "The argument is most vulnerable to criticism that it", options: ["Equivocates on the word 'person,' using it in two different senses","Draws a conclusion that is broader than the evidence warrants","Relies on an appeal to authority rather than logical evidence","Assumes what is true of a part is true of the whole","Treats a correlation as evidence of causation"], correct: 0 },
  { passage: "Either this company adopts a four-day workweek or it will lose its best employees to competitors. The company has not adopted a four-day workweek. Therefore, it will lose its best employees.", question: "The argument above is most vulnerable to the criticism that it", options: ["Presents only two options when other alternatives may exist","Draws a conclusion that is stronger than the evidence warrants","Relies on a premise that contradicts information provided elsewhere","Treats correlation as evidence of causation","Assumes what is true generally must be true in this specific case"], correct: 0 },
  { passage: "Archaeologist: This city must have had a population of at least fifty thousand during the classical period. We know this because its water infrastructure was designed to serve that many people.", question: "The method of reasoning can best be described as", options: ["Inferring facts about a cause from observable characteristics of its effects","Drawing an analogy between a current situation and a historical case","Applying a universal principle to reach a conclusion about a particular case","Ruling out alternative explanations through elimination","Using statistical data to establish the most probable explanation"], correct: 0 },
  { passage: "Some members of the city council support the new transit plan. All members of the city council were elected by district voters. Therefore, some people elected by district voters support the transit plan.", question: "The pattern of reasoning above is most similar to which of the following?", options: ["Some committee members favor the amendment. All committee members hold advanced degrees. Therefore, some people with advanced degrees favor the amendment.","All committee members favor the amendment. Some hold advanced degrees. Therefore, all people with advanced degrees favor it.","Some committee members hold advanced degrees. Some people with advanced degrees favor the amendment. Therefore, some committee members favor it.","No committee members oppose the amendment. Some people with advanced degrees are committee members. Therefore, no one with an advanced degree opposes it.","All committee members favor the amendment. No one with an advanced degree is on the committee. Therefore, no one with an advanced degree favors it."], correct: 0 },
];

const RC_PASSAGES = [
  { text: "Judicial review -- the power of courts to invalidate laws conflicting with the Constitution -- was established in Marbury v. Madison (1803). Chief Justice Marshall argued courts must interpret the Constitution as supreme over ordinary laws. Critics say this gives unelected judges too much power over democratically enacted legislation. Supporters counter that it is essential for protecting constitutional rights from majority overreach.", questions: [{ q: "What best describes the main purpose of the passage?", opts: ["To argue judicial review is unconstitutional","To explain the origin and controversy surrounding judicial review","To defend the Supreme Court's power","To criticize Chief Justice Marshall","To propose reforms to the judicial system"], correct: 1 }, { q: "Critics of judicial review would most object to:", opts: ["A court interpreting an ambiguous statute","A court striking down a popular law passed by Congress","A court hearing a constitutional rights case","A court following earlier precedent","A court dismissing a lawsuit for lack of standing"], correct: 1 }] },
  { text: "AI advances have led philosophers to reconsider the nature of consciousness. Traditional theories held that consciousness requires biological neurons, but AI now exhibits behaviors once thought to require awareness. However, philosopher John Searle's Chinese Room argument holds that computational processes, no matter how complex, cannot generate genuine understanding -- they merely simulate it.", questions: [{ q: "The passage suggests critics of the Chinese Room believe:", opts: ["Biological neurons are required for consciousness","Behavioral indistinguishability from consciousness may be sufficient evidence of it","All computational processes are conscious","Consciousness cannot exist in artificial systems","Understanding and consciousness are unrelated"], correct: 1 }, { q: "According to the passage, Searle's argument claims:", opts: ["Computers will never be powerful enough to be conscious","Only biological systems can exhibit awareness","Computational processes cannot produce genuine consciousness","AI systems do not exhibit sophisticated behaviors","Traditional theories of consciousness are outdated"], correct: 2 }] },
  { text: "The placebo effect -- real improvements from inactive treatments -- puzzled researchers until neuroimaging revealed that placebos trigger actual biochemical changes including release of endorphins and dopamine. This challenges the view that placebo effects are purely psychological. Some researchers now argue the effect demonstrates the brain's capacity for self-healing and should be harnessed in medical treatment.", questions: [{ q: "Which best expresses the passage's main idea?", opts: ["The placebo effect has no biological basis","Doctors should prescribe placebos more frequently","Recent research reveals biological mechanisms underlying the placebo effect","The placebo effect undermines trust in medicine","Neuroimaging has revolutionized brain science"], correct: 2 }, { q: "The passage suggests the traditional view of the placebo effect was that it:", opts: ["Could not produce real medical improvements","Was purely psychological rather than biological","Should be used more frequently in treatment","Was caused by endorphin release","Required informed consent from patients"], correct: 1 }] },
  { text: "Quantum computers use qubits that can exist in superposition, representing both 0 and 1 simultaneously. Combined with quantum entanglement, this allows exponentially faster calculation for certain problems. However, quantum systems are extremely fragile -- the slightest environmental interference causes decoherence, a major engineering challenge that has slowed practical development.", questions: [{ q: "According to the passage, the primary advantage of quantum computers is:", opts: ["They are smaller than classical computers","They perform certain calculations exponentially faster","They use less energy","They cost less to manufacture","They are more reliable"], correct: 1 }, { q: "The passage suggests that decoherence is:", opts: ["A desirable property of quantum systems","Caused by quantum entanglement","A major challenge facing quantum computing","Only a theoretical concern","Easily preventable with current technology"], correct: 2 }] },
  { text: "The Sapir-Whorf hypothesis holds that language shapes thought and perception. Strong versions claim language determines thought, making certain concepts impossible without appropriate vocabulary. Weaker versions suggest language merely influences thought patterns. Evidence comes from studies showing speakers of different languages perceive color and spatial relationships differently. Critics note that people can readily learn new concepts from other languages.", questions: [{ q: "What best describes the difference between strong and weak versions of the hypothesis?", opts: ["Strong versions have more empirical support","Strong versions claim language determines thought; weak versions say it influences thought","Strong versions apply to all languages; weak apply only to some","Strong versions concern vocabulary; weak versions concern grammar","Strong versions are accepted by linguists; weak versions are rejected"], correct: 1 }, { q: "Critics of linguistic relativity would be most strengthened by evidence that:", opts: ["Different languages have different numbers of color terms","Language learning becomes more difficult with age","People easily acquire and use concepts from foreign languages","Cultural practices vary across linguistic communities","Speakers of the same language think differently from each other"], correct: 2 }] },
  { text: "Behavioral economics challenges the classical rational actor model. Kahneman and Tversky demonstrated through empirical research that human decision-making is riddled with systematic biases. Loss aversion shows that people feel the pain of a loss roughly twice as intensely as the pleasure of an equivalent gain. Anchoring causes people to rely disproportionately on the first piece of information they encounter. Critics argue behavioral findings are context-dependent; proponents maintain that acknowledging irrationality improves institutional design.", questions: [{ q: "The passage suggests classical economic theory's primary weakness was:", opts: ["Failure to account for systematic human irrationality","Overemphasis on empirical research at the expense of theory","Inability to explain large-scale economic phenomena","Reliance on the work of too few economists","Neglect of institutional and policy applications"], correct: 0 }, { q: "Critics of behavioral economics would most likely claim:", opts: ["Human decision-making is fundamentally rational","Loss aversion is not a genuine phenomenon","Behavioral findings cannot be reliably generalized across contexts","Classical economic theory should be entirely abandoned","Kahneman and Tversky's research methodology was flawed"], correct: 2 }] },
  { text: "Maps do not simply record geographic reality -- they shape it by deciding what to include, what to omit, and how to represent scale. The Mercator projection dramatically inflates landmasses near the poles while compressing those near the equator, making Europe and North America appear larger relative to Africa and South America than they actually are. Scholars argue this distortion reinforced colonial worldviews. Alternative projections like the Peters map have been proposed, though they introduce their own geometric tradeoffs.", questions: [{ q: "The passage's main point is best expressed as:", opts: ["The Mercator projection was deliberately designed to promote colonialism","Maps are neutral technical documents without cultural significance","Cartographic choices reflect and reinforce particular perspectives on the world","The Peters map is superior to all other projections","Geographic distortion in maps is inevitable and cannot be corrected"], correct: 2 }, { q: "The Peters map differs from Mercator primarily in that it:", opts: ["Was developed specifically for nautical navigation","Attempts to represent the relative sizes of landmasses more accurately","Eliminates all geometric distortion","Depicts Europe and North America as smaller than they actually are","Was created during the colonial period"], correct: 1 }] },
  { text: "Ocean acidification occurs when atmospheric carbon dioxide dissolves in seawater forming carbonic acid. Since industrialization, ocean surface pH has fallen by approximately 0.1 units on a logarithmic scale -- a 26 percent increase in acidity. This threatens organisms that build shells from calcium carbonate, including corals and plankton that form the base of marine food webs. The rate of acidification may outpace biological adaptation. Researchers disagree about the threshold at which ecosystem collapse becomes irreversible.", questions: [{ q: "The passage suggests ocean acidification is particularly concerning because:", opts: ["It has already caused the extinction of several plankton species","Its rate may exceed the speed at which marine organisms can adapt","Researchers have identified the precise threshold of irreversible collapse","Carbon dioxide does not naturally dissolve in seawater","Only coral reefs are affected by changes in ocean pH"], correct: 1 }, { q: "A 0.1 unit pH drop on a logarithmic scale represents:", opts: ["A negligible change posing no threat to ecosystems","A 0.1 percent increase in ocean acidity","A 26 percent increase in ocean acidity","The threshold at which ecosystem collapse becomes likely","A change affecting temperature but not chemical composition"], correct: 2 }] },
];

function makeQuestions(templates, isRC, total) {
  const out = [];
  for (let i = 0; i < total; i++) {
    let passage, question, opts, correctIdx;
    if (isRC) {
      const p = templates[i % templates.length];
      const qi = Math.floor(i / templates.length) % p.questions.length;
      passage = p.text; question = p.questions[qi].q;
      opts = [...p.questions[qi].opts]; correctIdx = p.questions[qi].correct;
    } else {
      const t = templates[i % templates.length];
      passage = t.passage; question = t.question;
      opts = [...t.options]; correctIdx = t.correct;
    }
    let h = ((i * 2246822519 + 1) >>> 0);
    const ord = [0,1,2,3,4];
    for (let s = 4; s > 0; s--) {
      h = ((h ^ (h >>> 16)) >>> 0); h = ((h * 2246822519) >>> 0); h = ((h ^ (h >>> 13)) >>> 0);
      const j = h % (s + 1); const tmp = ord[s]; ord[s] = ord[j]; ord[j] = tmp;
    }
    out.push({ passage, question, options: ord.map(o => opts[o]), correct: ord.indexOf(correctIdx) });
  }
  return out;
}

const ALL_LR = makeQuestions(LR_TEMPLATES, false, 1300);
const ALL_RC = makeQuestions(RC_PASSAGES, true, 1300);

const LEARN = {
  lr: {
    title: "Logical Reasoning", color: "bg-indigo-600",
    overview: ["The LR section makes up two of the four scored sections, with 24-26 questions per section and 35 minutes each.", "Every question has a stimulus, a question stem, and five answer choices. Your job is to interact with the argument as the question demands.", "Key skills: identifying conclusions, recognizing assumptions, spotting logical flaws, and drawing valid inferences.", "Success requires methodical thinking -- find the conclusion and premises first, then anticipate the answer."],
    articles: [
      { id: "lr-flaw", title: "Flaw in the Reasoning", icon: "Flaw", summary: "Identify the logical error that undermines the argument", sections: [{ heading: "What It Is", body: "Flaw questions ask you to identify the specific logical error in the stimulus. The correct answer describes a reasoning mistake that actually occurs -- not just a possible weakness." }, { heading: "Common Flaw Types", bullets: ["Correlation/Causation: assuming because A and B occur together, A causes B", "False Dichotomy: assuming only two options exist when others are possible", "Circular Reasoning: using the conclusion as a premise", "Ad Hominem: attacking the person rather than the argument"] }, { heading: "Attack Strategy", body: "Find the conclusion, find the premises, then ask where the logical leap happens. Anticipate the flaw before reading answer choices." }] },
      { id: "lr-assumption", title: "Assumption Questions", icon: "Assum", summary: "Find the unstated premise the argument depends on", sections: [{ heading: "What It Is", body: "Assumption questions ask you to identify an unstated premise the argument requires. Without it, the conclusion would not follow from the evidence." }, { heading: "The Negation Test", body: "For Necessary Assumption questions, negate each answer choice. If negating it destroys the argument, that is your answer." }, { heading: "Attack Strategy", body: "Find the gap between premises and conclusion. The assumption will bridge this gap. Look for a concept in the conclusion that was not established by the premises." }] },
      { id: "lr-strengthen", title: "Strengthen and Weaken", icon: "S/W", summary: "Add evidence that supports or undermines the argument", sections: [{ heading: "Strengthen: Look For", bullets: ["A causal mechanism explaining the correlation", "Evidence eliminating alternative explanations", "Confirmation the sample is representative"] }, { heading: "Weaken: Look For", bullets: ["An alternative explanation for the evidence", "Evidence that correlation does not imply causation", "Proof that comparison cases differ in important ways"] }, { heading: "Key Rule", body: "Apply the 'if true' instruction literally. Assume each answer is true and ask only whether it helps or hurts the conclusion." }] },
      { id: "lr-inference", title: "Must Be True", icon: "MBT", summary: "Draw valid conclusions directly from the stimulus", sections: [{ heading: "What It Is", body: "Must Be True questions present facts, and you must identify which answer is guaranteed to be true based solely on those facts." }, { heading: "Attack Strategy", body: "Read the stimulus as a set of facts, not an argument. Note key logical relationships: if/then, all, some, none, most. The correct answer should feel nearly obvious once you find it." }, { heading: "Common Trap", body: "The answer that seems reasonable but requires a small additional assumption. On Must Be True questions, reasonable is not enough -- the answer must be airtight." }] },
      { id: "lr-parallel", title: "Parallel Reasoning", icon: "Para", summary: "Match the logical structure of the argument", sections: [{ heading: "What It Is", body: "Parallel Reasoning questions ask you to find an answer using the exact same pattern of reasoning as the stimulus, regardless of subject matter." }, { heading: "Attack Strategy", body: "Abstract the structure of the stimulus, replacing specific terms with variables. Note whether the argument is valid or flawed. Eliminate answers with different conclusion types or validity." }, { heading: "Key Rule", body: "If the original argument is flawed, the correct answer must also be flawed in the same way. Do not choose a logically valid answer when the stimulus contains a flaw." }] },
      { id: "lr-principle", title: "Principle Questions", icon: "Prin", summary: "Apply or identify the general rule behind the argument", sections: [{ heading: "Two Types", bullets: ["Identify the Principle: given a specific situation, find the general rule that justifies the reasoning", "Apply the Principle: given a general rule, find the situation it applies to"] }, { heading: "Identify the Principle", body: "Find the conclusion and premises. Ask: what general rule, if true, would make this reasoning valid?" }, { heading: "Apply the Principle", body: "Identify all conditions in the rule precisely. For each answer, ask whether the situation satisfies the rule's conditions and whether the conclusion drawn is correct." }] },
      { id: "lr-method", title: "Method of Reasoning", icon: "Meth", summary: "Describe how the argument makes its case", sections: [{ heading: "What It Is", body: "Method of Reasoning questions ask you to describe the technique the author uses -- not what the argument concludes, but HOW it argues." }, { heading: "Common Techniques", bullets: ["Offering a counterexample to disprove a general claim", "Drawing an analogy between two situations", "Eliminating alternatives to support a conclusion", "Pointing out a contradiction in the opposing view"] }, { heading: "Attack Strategy", body: "Read the stimulus and identify what the author is doing step by step. The correct answer describes the argumentative move accurately." }] },
    ]
  },
  rc: {
    title: "Reading Comprehension", color: "bg-purple-600",
    overview: ["The RC section contains four passage sets with 5-8 questions each, approximately 27 questions in 35 minutes.", "Passages come from humanities, social sciences, natural sciences, and law. The challenge is the nuance and layering of ideas.", "Key skills: identifying the main point, understanding the author's purpose and tone, drawing inferences, understanding the function of details.", "Strong RC performance requires active reading -- mapping the author's argument as you go."],
    articles: [
      { id: "rc-mainpoint", title: "Main Point and Primary Purpose", icon: "Main", summary: "Identify what the passage is fundamentally about", sections: [{ heading: "What It Tests", body: "These questions ask you to identify the central argument of the entire passage. They test whether you read the passage as a unified whole." }, { heading: "The Scope Test", body: "Ask of each answer: does the passage spend most of its time arguing for this? The correct answer must be neither too broad nor too narrow." }, { heading: "Common Wrong Answers", bullets: ["Too narrow: describes only one paragraph", "Too broad: makes a claim bigger than anything the passage argues", "Distorted: accurately describes a detail but mischaracterizes the whole"] }] },
      { id: "rc-inference", title: "Inference and Must Be True", icon: "Infer", summary: "Draw conclusions the passage supports but does not state", sections: [{ heading: "What It Tests", body: "RC Inference questions ask you to identify something that must be true based on the passage, even though it is not directly stated." }, { heading: "Attack Strategy", body: "Do not answer from memory. Go back to the passage and find the specific lines that support the inference. For 'the author would agree' questions, the answer must match the author's demonstrated attitude." }, { heading: "Common Trap", body: "Answers that sound reasonable but go beyond what the passage supports, or that confuse a view the author describes with a view the author endorses." }] },
      { id: "rc-function", title: "Function of a Detail", icon: "Func", summary: "Explain why a specific detail appears in the passage", sections: [{ heading: "What It Tests", body: "Function questions ask why a specific word, phrase, sentence, or paragraph appears -- not what it means, but what argumentative role it plays." }, { heading: "Possible Roles", bullets: ["Providing an example to illustrate a general claim", "Introducing an objection the author will then refute", "Offering evidence for the main argument", "Contrasting with another position", "Qualifying or limiting a claim"] }, { heading: "Attack Strategy", body: "Go back to the specific detail. Read the sentences immediately before and after it. The correct answer describes the detail's ROLE." }] },
      { id: "rc-attitude", title: "Author Tone and Attitude", icon: "Tone", summary: "Understand how the author feels about the subject", sections: [{ heading: "What It Tests", body: "These questions ask you to characterize how the author feels about the subject matter. LSAT authors have measured but discernible perspectives." }, { heading: "Tone Signals to Watch", bullets: ["'Unfortunately...' -- author disapproves of something", "'Surprisingly...' -- author finds something unexpected", "'Despite X...' -- author acknowledges a counterpoint", "'What is often overlooked...' -- author is making a corrective argument"] }, { heading: "Common Correct Tones", bullets: ["Qualified support", "Cautious optimism", "Measured skepticism", "Critical but acknowledging"] }] },
      { id: "rc-structure", title: "Passage Structure", icon: "Struc", summary: "Map how the passage is organized and why", sections: [{ heading: "Common Structures", bullets: ["Problem then Solution: author identifies a problem and proposes a fix", "Theory A vs Theory B: author presents and evaluates competing explanations", "Conventional Wisdom then Challenge: author challenges what people believe", "Historical Background then Contemporary Application"] }, { heading: "Building Your Passage Map", body: "As you finish each paragraph, note its function in one phrase: 'introduces the problem,' 'presents theory A,' 'criticizes theory A.' Structure questions ask you to describe these functions in sequence." }] },
      { id: "rc-comparative", title: "Comparative Reading", icon: "Comp", summary: "Handle paired passages and their relationship", sections: [{ heading: "What It Is", body: "One of the four RC sets has two shorter passages on the same topic. Questions ask about each passage individually and about how the two relate." }, { heading: "Common Relationships", bullets: ["One supports the other's thesis with different evidence", "One challenges or qualifies the other's claim", "They address the same phenomenon with different explanations"] }, { heading: "Question Types", bullets: ["'Both authors would agree that...' -- find a claim supported in BOTH passages", "'The authors disagree about...' -- find an issue where their positions are directly opposed"] }] },
      { id: "rc-activeread", title: "Active Reading Strategy", icon: "Read", summary: "How to read LSAT passages for maximum retention", sections: [{ heading: "The Active Reading Framework", body: "As you read each paragraph, ask: (1) What is the author DOING here? (2) What is the author SAYING -- the main claim in one sentence? (3) How does it CONNECT to what came before?" }, { heading: "What to Mark", bullets: ["The thesis -- often in paragraph 1 or the final paragraph", "Contrast signals: however, but, yet, on the other hand, despite", "Emphasis signals: importantly, crucially, the key point", "The author's evaluative language -- words that reveal opinion"] }, { heading: "Time Management", body: "Spend 3-4 minutes reading and mapping, then 1-1.5 minutes per question. The investment in careful reading pays off every time." }] },
    ]
  },
  lsat: {
    title: "The LSAT Structure", color: "bg-emerald-600",
    overview: ["Understanding how the LSAT is structured is as important as knowing the content.", "The LSAT consists of scored sections plus one unscored writing sample, with 35 minutes for each section.", "Preparation is not just about learning material -- it is also about building stamina and managing time under pressure."],
    articles: [
      { id: "lsat-structure", title: "How the LSAT Is Structured", icon: "Str", summary: "A complete breakdown of every section of the test", sections: [{ heading: "The Three Scored Sections", bullets: ["Logical Reasoning: two sections, approximately 24-26 questions each, 35 minutes per section", "Reading Comprehension: one section, four passage sets with 5-8 questions each, 35 minutes"] }, { heading: "The Experimental Section", body: "Every LSAT includes one unscored experimental section that looks identical to a real section. You will not know which section is experimental, so treat every section as if it counts." }, { heading: "Score Scale", body: "LSAT scores range from 120 to 180. The median score is approximately 151. There is no penalty for wrong answers -- always guess rather than leave a question blank." }] },
      { id: "lsat-timing", title: "How to Manage Your Time", icon: "Time", summary: "Section-by-section pacing strategies to maximize your score", sections: [{ heading: "Logical Reasoning Pacing", body: "With roughly 25 questions in 35 minutes, you have about 84 seconds per question. Never spend more than 2 minutes on any single question -- if stuck, guess and move on." }, { heading: "Reading Comprehension Pacing", body: "With four passage sets in 35 minutes, aim for about 8-9 minutes per set. Spend 3-4 minutes reading and mapping, then 1-1.5 minutes per question." }, { heading: "The Two-Pass Strategy", body: "Do a first pass through all questions and answer the ones you are confident about. Skip or guess on questions taking too long. Return to skipped questions with remaining time." }] },
      { id: "lsat-testday", title: "How to Prepare for Test Day", icon: "Day", summary: "Everything you need to do before, during, and after the exam", sections: [{ heading: "The Week Before", bullets: ["Do not cram -- review strategies you already know and do light practice", "Take one full timed practice test early in the week, then rest", "Confirm your test center location or online testing setup"] }, { heading: "The Night Before", bullets: ["Do not study -- your brain needs rest, not more input", "Prepare everything you need: ID, admission ticket, snacks, water", "Go to bed at your normal time or slightly earlier"] }, { heading: "During the Test", bullets: ["Treat every section as if it counts", "Use the break to reset mentally", "If a section goes badly, leave it behind -- each section is a fresh start"] }] },
    ]
  }
};

export default function SpecterLSATApp() {
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [showTerms, setShowTerms] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showHome, setShowHome] = useState(true);
  const [section, setSection] = useState(null);
  const [testIdx, setTestIdx] = useState(null);
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showRes, setShowRes] = useState(false);
  const [selAns, setSelAns] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showAccess, setShowAccess] = useState(false);
  const [completed, setCompleted] = useState({});
  const [showLearn, setShowLearn] = useState(false);
  const [learnSec, setLearnSec] = useState(null);
  const [learnArt, setLearnArt] = useState(null);
  const [showAccount, setShowAccount] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [testHistory, setTestHistory] = useState({});
  const [showDrill, setShowDrill] = useState(false);
  const [drillType, setDrillType] = useState(null); // 'lr' | 'rc' | 'mixed'
  const [drillQ, setDrillQ] = useState(null);
  const [drillSel, setDrillSel] = useState(null);
  const [drillShowRes, setDrillShowRes] = useState(false);
  const [drillScore, setDrillScore] = useState({ correct: 0, total: 0 });
  const [drillHistory, setDrillHistory] = useState([]);
  const [tActive, setTActive] = useState(false);
  const [tDone, setTDone] = useState(false);
  const [tParts, setTParts] = useState([]);
  const [tPartIdx, setTPartIdx] = useState(0);
  const [tAnswers, setTAnswers] = useState({});
  const [tQ, setTQ] = useState(0);
  const [tSel, setTSel] = useState(null);
  const [tShowRes, setTShowRes] = useState(false);
  const [tTime, setTTime] = useState(35 * 60);
  const [tScores, setTScores] = useState([]);

  useEffect(() => {
    ls.get("su").then(r => {
      if (r && r.value) {
        const u = JSON.parse(r.value);
        setUser(u); setShowHome(false);
        ls.get("ct_" + u.username).then(t => { if (t && t.value) setCompleted(JSON.parse(t.value)); }).catch(() => {});
        ls.get("th_" + u.username).then(t => { if (t && t.value) setTestHistory(JSON.parse(t.value)); }).catch(() => {});
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (user && Object.keys(completed).length > 0) ls.set("ct_" + user.username, JSON.stringify(completed)).catch(() => {});
  }, [completed, user]);
  useEffect(() => {
    if (user && Object.keys(testHistory).length > 0) ls.set("th_" + user.username, JSON.stringify(testHistory)).catch(() => {});
  }, [completed, user]);

  useEffect(() => {
    if (!tActive || tDone) return;
    const iv = setInterval(() => setTTime(t => t <= 1 ? 0 : t - 1), 1000);
    return () => clearInterval(iv);
  }, [tActive, tPartIdx, tDone]);

  useEffect(() => { if (tActive && tTime === 0 && !tDone) doAdvance(); }, [tTime]);

  const canAccess = user && (user.isAdmin || user.isPremium || user.hasTestAccess);

  const getQs = (type, idx) => (type === "lr" ? ALL_LR : ALL_RC).slice(idx * 26, idx * 26 + 26);

  const doLogin = async () => {
    const username = form.username.trim();
    const password = form.password;
    if (!username || !password) return alert("Please fill in all fields");
    if (username === "admin1" && password === "Leroybrown") {
      const u = { username: "admin1", email: "admin@specterlsat.com", isPremium: true, hasTestAccess: true, isAdmin: true, createdAt: new Date().toISOString() };
      try { await ls.set("su", JSON.stringify(u)); } catch(e) {}
      setUser(u); setShowHome(false); setForm({ username: "", email: "", password: "" }); return;
    }
    if (username === "influencer1" && password === "influencerpass1") {
      const u = { username: "influencer1", email: "influencer@specterlsat.com", isPremium: true, hasTestAccess: true, isAdmin: true, createdAt: new Date().toISOString() };
      try { await ls.set("su", JSON.stringify(u)); } catch(e) {}
      setUser(u); setShowHome(false); setForm({ username: "", email: "", password: "" }); return;
    }
    if (username === "Admin" && password === "Leroybrown22!") {
      const u = { username: "Admin", email: "admin@specterlsat.com", isPremium: true, hasTestAccess: true, isAdmin: true, createdAt: new Date().toISOString() };
      try { await ls.set("su", JSON.stringify(u)); } catch(e) {}
      setUser(u); setShowHome(false); setForm({ username: "", email: "", password: "" }); return;
    }
    try {
      const r = await ls.get("u_" + username);
      if (!r || !r.value) return alert("User not found. Please sign up first.");
      const u = JSON.parse(r.value);
      if (u.password !== password) return alert("Incorrect password");
      try { await ls.set("su", JSON.stringify(u)); } catch(e) {}
      try { const t = await ls.get("ct_" + u.username); if (t && t.value) setCompleted(JSON.parse(t.value)); } catch (e) {}
      try { const t = await ls.get("th_" + u.username); if (t && t.value) setTestHistory(JSON.parse(t.value)); } catch (e) {}
      setUser(u); setShowHome(false); setForm({ username: "", email: "", password: "" });
    } catch (e) { alert("Error logging in. Please try again."); }
  };

  const doSignUp = async () => {
    if (!form.username || !form.email || !form.password) return alert("Please fill in all fields");
    try {
      try { const ex = await ls.get("u_" + form.username); if (ex && ex.value) return alert("Username already exists."); } catch (e) {}
      const u = { username: form.username, email: form.email, password: form.password, isPremium: false, hasTestAccess: false, createdAt: new Date().toISOString() };
      await ls.set("u_" + form.username, JSON.stringify(u));
      setForm({ username: "", email: "", password: "" }); setIsLogin(true); alert("Account created! Please login.");
    } catch (e) { alert("Error creating account. Please try again."); }
  };

  const doLogout = async () => {
    try { await ls.delete("su"); } catch (e) {}
    setUser(null); setSection(null); setTestIdx(null); setQIdx(0); setAnswers({}); setShowRes(false); setSelAns(null); setCompleted({}); setTestHistory({});
  };

  const upgrade = (premium) => {
    const url = premium
      ? 'https://buy.stripe.com/6oU6oAfj27c0367g1N7EQ05'
      : 'https://buy.stripe.com/dRm5kw6MweEs9uv2aX7EQ01';
    window.open(url, '_blank');
  };

  const startTimed = () => {
    const lr1 = Math.floor(Math.random() * 50); let lr2 = Math.floor(Math.random() * 50);
    while (lr2 === lr1) lr2 = Math.floor(Math.random() * 50);
    const rc1 = Math.floor(Math.random() * 50);
    setTParts([{ type: "lr", idx: lr1, label: "Logical Reasoning I" }, { type: "lr", idx: lr2, label: "Logical Reasoning II" }, { type: "rc", idx: rc1, label: "Reading Comprehension" }]);
    setTPartIdx(0); setTAnswers({}); setTQ(0); setTSel(null); setTShowRes(false); setTTime(35 * 60); setTDone(false); setTScores([]); setTActive(true);
  };

  const doAdvance = () => {
    const qs = tParts[tPartIdx] ? getQs(tParts[tPartIdx].type, tParts[tPartIdx].idx) : [];
    const correct = Object.keys(tAnswers).filter(k => tAnswers[k] === qs[+k]?.correct).length;
    const ns = [...tScores, { part: tParts[tPartIdx]?.label, correct, total: qs.length }];
    setTScores(ns);
    if (tPartIdx >= tParts.length - 1) { setTDone(true); setTActive(false); }
    else { setTPartIdx(i => i + 1); setTAnswers({}); setTQ(0); setTSel(null); setTShowRes(false); setTTime(35 * 60); }
  };

  const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const Suit = ({ size = 10 }) => (
    <svg className={`w-${size} h-${size}`} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="9" r="6" fill="#1a1a1a" />
      <path d="M8 38 C8 26 12 22 20 22 C28 22 32 26 32 38 Z" fill="#1a1a1a" />
      <rect x="12" y="22" width="4" height="12" fill="#111" />
      <rect x="24" y="22" width="4" height="12" fill="#111" />
      <rect x="14" y="22" width="12" height="2" fill="#1a1a1a" />
      <polygon points="20,24 17,30 23,30" fill="white" />
      <rect x="19" y="26" width="2" height="6" fill="white" />
    </svg>
  );

  // HOME
  if (showHome && !user) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-md"><div className="max-w-7xl mx-auto px-4 md:px-6 flex justify-between items-center h-16 md:h-20"><div className="flex items-center gap-2 md:gap-3"><Suit /><span className="text-base md:text-xl font-bold text-gray-800">Specter LSAT Prep</span></div><div className="flex items-center gap-1 md:gap-3"><button onClick={() => setShowPricing(true)} className="text-indigo-600 font-semibold hover:text-indigo-800 px-2 md:px-4 py-2 text-sm md:text-base">Pricing</button><button onClick={() => setShowContact(true)} className="text-indigo-600 font-semibold hover:text-indigo-800 px-2 md:px-4 py-2 text-sm md:text-base">Contact</button><button onClick={() => setShowHome(false)} className="bg-indigo-600 text-white px-4 md:px-8 py-2 md:py-3 rounded-lg text-sm md:text-base font-semibold hover:bg-indigo-700">Get Started</button></div></div></nav>
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">Master the LSAT with Confidence</h1>
          <p className="text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">Comprehensive practice materials designed for success</p>
          <button onClick={() => setShowHome(false)} className="bg-indigo-600 text-white px-12 py-4 rounded-lg font-bold text-xl hover:bg-indigo-700 shadow-xl">Start Practicing Now</button>
        </div>
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[{n:"2600",l:"Practice Questions",d:"Comprehensive LR and RC coverage"},{n:"100",l:"Full Practice Tests",d:"Timed practice exams per section"},{n:"100%",l:"Detailed Explanations",d:"Learn from every mistake"}].map((s,i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg p-8 text-center"><div className="text-5xl font-bold text-indigo-600 mb-2">{s.n}</div><div className="text-xl font-semibold text-gray-800 mb-2">{s.l}</div><p className="text-gray-600">{s.d}</p></div>
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-12 mb-16">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Why Choose Specter LSAT Prep?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[{I:Brain,t:"Expert-Crafted Questions",d:"Every question mirrors the style and difficulty of actual LSAT questions."},{I:BookOpen,t:"Comprehensive Coverage",d:"1,300 questions per section in manageable 26-question practice tests."},{I:CheckCircle,t:"Instant Feedback",d:"Get immediate results after each question to track your progress."},{I:Crown,t:"Premium Explanations",d:"Understand why correct answers are right and wrong answers are wrong."},{I:BookOpen,t:"Free Learn Section",d:"17 in-depth strategy articles covering every question type. Free for all users.",b:"Free"},{I:List,t:"Timed Full LSAT",d:"Full timed exam with two LR sections and one RC section, 35 min each.",b:"Premium"},{I:CheckCircle,t:"Drill Mode",d:"Unlimited random questions from the full bank. Track your accuracy in real time. Free for all users -- premium users unlock detailed explanations after every question.",b:"Free"}].map(({I,t,d,b},i) => (
              <div key={i} className="flex gap-4"><div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0"><I className="w-6 h-6 text-indigo-600" /></div><div><h3 className="text-lg font-bold text-gray-900 mb-1">{t}{b && <span className={`text-xs font-semibold ml-2 px-2 py-0.5 rounded-full ${b==="Free"?"bg-emerald-100 text-emerald-600":"bg-purple-100 text-purple-600"}`}>{b}</span>}</h3><p className="text-gray-600 text-sm">{d}</p></div></div>
            ))}
          </div>
        </div>
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-10">Affordable, Effective Preparation</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-200"><h3 className="text-2xl font-bold text-gray-900 mb-3">Test Access</h3><div className="mb-4"><span className="text-5xl font-bold">$35</span><span className="text-xl text-gray-500">/month</span></div>{["All 2,600 questions","100 practice tests","Instant score feedback"].map((x,i)=><div key={i} className="flex items-center gap-2 text-gray-700 mb-2"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0"/>{x}</div>)}</div>
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white relative"><div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-gray-900 text-sm px-4 py-1 rounded-full font-bold">BEST VALUE</div><h3 className="text-2xl font-bold mb-3">Premium Access</h3><div className="mb-4"><span className="text-5xl font-bold">$45</span><span className="text-xl opacity-90">/month</span></div>{["Everything in Test Access","Detailed answer explanations","Learn from every mistake"].map((x,i)=><div key={i} className="flex items-center gap-2 mb-2"><CheckCircle className="w-5 h-5 text-yellow-300 flex-shrink-0"/>{x}</div>)}</div>
          </div>
        </div>
      </div>
      <footer className="bg-gray-900 text-white py-10"><div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4"><div className="flex items-center gap-3"><Suit size={8}/><span className="text-2xl font-bold">Specter LSAT Prep</span></div><div className="flex items-center gap-6"><button onClick={() => setShowContact(true)} className="text-gray-400 hover:text-white">Contact Us</button><button onClick={() => setShowTerms(true)} className="text-gray-400 hover:text-white">Terms of Service</button></div></div><p className="text-center text-gray-500 text-sm mt-6">2026 Specter LSAT Prep. LSAT is a registered trademark of LSAC. Not affiliated with LSAC.</p></footer>
      {showPricing && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 md:p-10 shadow-2xl my-4 md:my-8">
            <div className="flex justify-between items-center mb-6 md:mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Simple, Transparent Pricing</h2>
                <p className="text-gray-500 mt-1 text-sm md:text-base">Choose the plan that fits your preparation goals</p>
              </div>
              <button onClick={() => setShowPricing(false)} className="text-gray-400 hover:text-gray-600 text-3xl font-bold leading-none ml-4">x</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
              <div className="border-2 border-gray-200 rounded-2xl p-6 md:p-8 hover:border-indigo-300 transition-all">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Test Access</h3>
                <div className="mb-4 md:mb-6"><span className="text-5xl md:text-6xl font-bold text-gray-900">$35</span><span className="text-xl text-gray-500">/month</span></div>
                <p className="text-gray-600 mb-4 md:mb-6 text-sm md:text-base">Everything you need to practice at full volume with real exam conditions.</p>
                <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                  {[["2,600 total practice questions","1,300 per section across LR and RC"],["100 full practice tests","50 per section, 26 questions each"],["Randomized answer positions","No predictable patterns"],["Timed Full Test mode","Simulate real LSAT with auto-advancing sections"],["Instant score feedback","See your results after every question"],["Free Learn section","17 in-depth strategy articles included"],["Drill Mode access","Unlimited random questions -- track your accuracy live"]].map(([title, desc], i) => (
                    <li key={i} className="flex gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div><p className="font-semibold text-gray-800 text-sm md:text-base">{title}</p><p className="text-xs md:text-sm text-gray-500">{desc}</p></div>
                    </li>
                  ))}
                  <li className="flex gap-3"><XCircle className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" /><div><p className="font-semibold text-gray-400 text-sm md:text-base">No answer explanations</p><p className="text-xs md:text-sm text-gray-400">Upgrade to Premium to unlock</p></div></li>
                </ul>
                <a href="https://buy.stripe.com/dRm5kw6MweEs9uv2aX7EQ01" target="_blank" rel="noopener noreferrer" className="w-full bg-gray-900 text-white py-3 md:py-4 rounded-xl font-bold text-base md:text-lg hover:bg-gray-800 transition-all block text-center">Get Test Access</a>
              </div>
              <div className="border-2 border-indigo-500 rounded-2xl p-6 md:p-8 bg-gradient-to-br from-indigo-50 to-purple-50 relative mt-4 md:mt-0">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-1.5 rounded-full text-sm font-bold">BEST VALUE</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium Access</h3>
                <div className="mb-4 md:mb-6"><span className="text-5xl md:text-6xl font-bold text-gray-900">$45</span><span className="text-xl text-gray-500">/month</span></div>
                <p className="text-gray-600 mb-4 md:mb-6 text-sm md:text-base">Everything in Test Access, plus the explanations that accelerate your learning.</p>
                <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                  {[["Everything in Test Access","All 2,600 questions and 100 practice tests"],["Drill Mode with full explanations","See why each answer is right or wrong after every drill question"],["Detailed correct answer explanations","Understand exactly why each answer is right"],["Detailed wrong answer explanations","Learn from every mistake you make"],["Unlocked after test completion","Complete a test to access its explanations"],["Faster score improvement","Students with explanations improve 2x faster"]].map(([title, desc], i) => (
                    <li key={i} className="flex gap-3">
                      <CheckCircle className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                      <div><p className="font-semibold text-gray-800 text-sm md:text-base">{title}</p><p className="text-xs md:text-sm text-gray-500">{desc}</p></div>
                    </li>
                  ))}
                </ul>
                <a href="https://buy.stripe.com/6oU6oAfj27c0367g1N7EQ05" target="_blank" rel="noopener noreferrer" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 md:py-4 rounded-xl font-bold text-base md:text-lg hover:from-indigo-700 hover:to-purple-700 transition-all block text-center">Get Premium Access</a>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 md:p-6 text-center mb-4">
              <p className="text-gray-600 text-sm"><span className="font-semibold">Not sure which plan to choose?</span> Start with Test Access and upgrade to Premium any time. Both plans include the free Learn section with 17 strategy articles.</p>
              <p className="text-gray-400 text-xs mt-2">No refunds are provided. Cancel anytime to stop future charges. Governed by the laws of Florida, USA.</p>
            </div>
            <button onClick={() => { setShowPricing(false); }} className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all">Back to Home</button>
          </div>
        </div>
      )}
      {showContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Contact Us</h2>
              <button onClick={() => setShowContact(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none">x</button>
            </div>
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Phone</p>
                  <a href="tel:9044828164" className="text-lg font-bold text-gray-800 hover:text-indigo-600">(904) 482-8164</a>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">TikTok</p>
                  <a href="https://www.tiktok.com/@specterlsatprep" target="_blank" rel="noopener noreferrer" className="text-lg font-bold text-gray-800 hover:text-pink-600">@specterlsatprep</a>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Email</p>
                  <a href="mailto:specterlsatprep@gmail.com" className="text-lg font-bold text-gray-800 hover:text-indigo-600">specterlsatprep@gmail.com</a>
                </div>
              </div>
            </div>
            <button onClick={() => setShowContact(false)} className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700">Close</button>
          </div>
        </div>
      )}
      {showTerms && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl"><h2 className="text-2xl font-bold mb-4">Terms of Service</h2><div className="text-sm text-gray-700 space-y-3 max-h-64 overflow-y-auto"><p><strong>1.</strong> By using Specter LSAT Prep, you agree to these Terms.</p><p><strong>2.</strong> Test Access ($35/mo): all questions and tests. Premium ($45/mo): adds detailed explanations.</p><p><strong>3. NO REFUNDS ARE PROVIDED.</strong></p><p><strong>4.</strong> Governed by laws of Florida, USA.</p><p><strong>5.</strong> specterlsatprep@gmail.com</p></div><button onClick={()=>setShowTerms(false)} className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700">Close</button></div></div>}
    </div>
  );

  // AUTH
  if (!user) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <button onClick={() => setShowHome(true)} className="text-indigo-600 hover:text-indigo-800 mb-4 text-sm">Back to Home</button>
        <div className="text-center mb-8"><h1 className="text-3xl font-bold text-gray-800 mb-2">Specter LSAT Prep</h1><p className="text-gray-600">Take the first step towards mastering your LSAT</p></div>
        <div className="flex gap-2 mb-6">{["Login","Sign Up"].map((l,i)=><button key={i} onClick={()=>setIsLogin(i===0)} className={`flex-1 py-2 rounded-lg font-semibold ${(i===0)===isLogin?"bg-indigo-600 text-white":"bg-gray-100 text-gray-600"}`}>{l}</button>)}</div>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Username</label><input type="text" value={form.username} onChange={e=>setForm({...form,username:e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="Enter username"/></div>
          {!isLogin && <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="Enter email"/></div>}
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Password</label><input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="Enter password"/></div>
          <button onClick={isLogin?doLogin:doSignUp} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 flex items-center justify-center gap-2">{isLogin?<><LogIn className="w-5 h-5"/>Login</>:<><UserPlus className="w-5 h-5"/>Sign Up</>}</button>
        </div>
        <div className="mt-4 text-center text-sm text-gray-600">{isLogin?"Don't have an account?":"Already have an account?"}<button onClick={()=>setIsLogin(!isLogin)} className="text-indigo-600 font-semibold ml-1">{isLogin?"Sign up":"Login"}</button></div>
        <div className="mt-3 text-center"><button onClick={()=>setShowTerms(true)} className="text-xs text-gray-500 underline">Terms of Service</button></div>
      </div>
    </div>
  );

  // LEARN
  if (showLearn) {
    if (learnArt && learnSec) {
      const sec = LEARN[learnSec]; const art = sec.articles.find(a=>a.id===learnArt); const arts = sec.articles; const idx = arts.findIndex(a=>a.id===learnArt);
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
          <div className="max-w-3xl mx-auto">
            <button onClick={()=>setLearnArt(null)} className="text-indigo-600 hover:text-indigo-800 mb-6 font-medium">Back to {sec.title}</button>
            <div className={`${sec.color} rounded-2xl p-6 mb-6 text-white`}><div className="bg-white bg-opacity-20 inline-block rounded-lg px-3 py-1 text-sm font-bold mb-3">{art.icon}</div><h1 className="text-2xl font-bold mb-2">{art.title}</h1><p className="opacity-90 text-sm">{art.summary}</p></div>
            <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
              {art.sections.map((s,i)=>(
                <div key={i}><h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3 pb-2 border-b-2 border-indigo-100">{s.heading}</h2>{s.body&&<p className="text-gray-700 leading-relaxed">{s.body}</p>}{s.bullets&&<ul className="space-y-2 mt-2">{s.bullets.map((b,j)=><li key={j} className="flex gap-3 text-gray-700"><span className="text-indigo-500 font-bold flex-shrink-0">-</span><span>{b}</span></li>)}</ul>}</div>
              ))}
            </div>
            <div className="mt-6 flex gap-3">{idx>0&&<button onClick={()=>setLearnArt(arts[idx-1].id)} className="flex-1 bg-white text-indigo-600 border-2 border-indigo-300 py-3 rounded-xl font-semibold hover:bg-indigo-50">Previous Article</button>}{idx<arts.length-1&&<button onClick={()=>setLearnArt(arts[idx+1].id)} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700">Next Article</button>}</div>
          </div>
        </div>
      );
    }
    if (learnSec) {
      const sec = LEARN[learnSec];
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
          <div className="max-w-3xl mx-auto">
            <button onClick={()=>setLearnSec(null)} className="text-indigo-600 hover:text-indigo-800 mb-6 font-medium">Back to Learn</button>
            <div className={`${sec.color} rounded-2xl p-8 mb-8 text-white`}><h1 className="text-3xl font-bold mb-4">{sec.title}</h1>{sec.overview.map((p,i)=><p key={i} className="opacity-90 text-sm mb-3 leading-relaxed">{p}</p>)}</div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Articles</h2>
            <div className="space-y-3">{sec.articles.map(art=>(
              <button key={art.id} onClick={()=>setLearnArt(art.id)} className="w-full bg-white rounded-xl shadow p-5 hover:shadow-lg hover:bg-indigo-50 border-2 border-transparent hover:border-indigo-200 flex items-center gap-4 text-left">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0"><span className="text-xs font-bold text-indigo-600">{art.icon}</span></div>
                <div className="flex-1"><h3 className="font-bold text-gray-800 mb-1">{art.title}</h3><p className="text-sm text-gray-500">{art.summary}</p></div>
                <ChevronRight className="w-5 h-5 text-indigo-400 flex-shrink-0"/>
              </button>
            ))}</div>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <button onClick={()=>setShowLearn(false)} className="text-indigo-600 hover:text-indigo-800 mb-6 font-medium">Back to Dashboard</button>
          <div className="text-center mb-10"><h1 className="text-4xl font-bold text-gray-800 mb-3">Learn</h1><p className="text-gray-600 text-lg">Master every question type with in-depth strategy guides</p></div>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <button onClick={()=>setLearnSec("lr")} className="bg-indigo-600 rounded-2xl p-8 text-white text-left hover:bg-indigo-700"><div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mb-4"><Brain className="w-6 h-6 text-white"/></div><h2 className="text-2xl font-bold mb-2">Logical Reasoning</h2><p className="text-indigo-200 text-sm mb-3">Master 7 question types with detailed attack strategies</p><div className="text-indigo-300 text-sm font-semibold">{LEARN.lr.articles.length} articles</div></button>
            <button onClick={()=>setLearnSec("rc")} className="bg-purple-600 rounded-2xl p-8 text-white text-left hover:bg-purple-700"><div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mb-4"><BookOpen className="w-6 h-6 text-white"/></div><h2 className="text-2xl font-bold mb-2">Reading Comprehension</h2><p className="text-purple-200 text-sm mb-3">Learn active reading and tackle every RC question type</p><div className="text-purple-300 text-sm font-semibold">{LEARN.rc.articles.length} articles</div></button>
          </div>
          <button onClick={()=>setLearnSec("lsat")} className="w-full bg-emerald-600 rounded-2xl p-8 text-white text-left hover:bg-emerald-700 mb-6"><div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mb-4"><List className="w-6 h-6 text-white"/></div><h2 className="text-2xl font-bold mb-2">The LSAT Structure</h2><p className="text-emerald-200 text-sm mb-3">How the test is built, timing strategies, and test day prep</p><div className="text-emerald-300 text-sm font-semibold">{LEARN.lsat.articles.length} articles</div></button>
          <div className="bg-white rounded-2xl shadow p-6"><h3 className="font-bold text-gray-800 mb-2">How to use the Learn section</h3><p className="text-gray-600 text-sm">Start with the section overview, then work through the articles. After reading, head to practice tests to apply what you have learned.</p></div>
        </div>
      </div>
    );
  }

  // TIMED DONE
  if (tDone) {
    const tot = tScores.reduce((a,s)=>a+s.correct,0); const totQ = tScores.reduce((a,s)=>a+s.total,0);
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-lg w-full text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Full Test Complete!</h2>
          <p className="text-gray-500 mb-8">Here is how you did across all three sections</p>
          <div className="space-y-4 mb-8">
            {tScores.map((s,i)=><div key={i} className="bg-gray-50 rounded-xl p-4 flex justify-between items-center"><div className="text-left"><p className="font-semibold text-gray-800">{s.part}</p><p className="text-sm text-gray-500">{s.total} questions</p></div><div className="text-right"><p className="text-2xl font-bold text-indigo-600">{s.correct}/{s.total}</p><p className="text-sm text-gray-500">{Math.round(s.correct/s.total*100)}%</p></div></div>)}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 text-white flex justify-between items-center"><div className="font-bold text-lg">Total Score</div><div><p className="text-2xl font-bold">{tot}/{totQ}</p><p className="text-sm opacity-80">{Math.round(tot/totQ*100)}%</p></div></div>
          </div>
          <div className="flex gap-3"><button onClick={()=>{setTDone(false);startTimed();}} className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700">Take Another</button><button onClick={()=>setTDone(false)} className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300">Back to Menu</button></div>
        </div>
      </div>
    );
  }

  // TIMED ACTIVE
  if (tActive && tParts.length > 0) {
    const part = tParts[tPartIdx]; const qs = getQs(part.type, part.idx); const q = qs[tQ];
    const isU = tTime <= 300; const isC = tTime <= 60;
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4 bg-white rounded-xl shadow px-6 py-3">
            <div><span className="font-bold text-gray-800 text-lg">{part.label}</span><span className="ml-3 text-sm text-gray-500">Section {tPartIdx+1} of {tParts.length}</span></div>
            <div className={`px-4 py-2 rounded-lg font-bold text-xl ${isC?"bg-red-600 text-white":isU?"bg-orange-100 text-orange-700":"bg-indigo-50 text-indigo-700"}`}>{fmt(tTime)}</div>
            <button onClick={doAdvance} className="text-sm text-gray-500 hover:text-red-600 font-semibold">End Section</button>
          </div>
          <div className="flex gap-2 mb-4">{tParts.map((_,i)=><div key={i} className={`h-2 rounded-full flex-1 ${i<tPartIdx?"bg-green-500":i===tPartIdx?"bg-indigo-600":"bg-gray-200"}`}/>)}</div>
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <div className="flex justify-between mb-4"><span className="text-gray-600">Question {tQ+1} of {qs.length}</span><span className="text-sm text-gray-500">{Object.keys(tAnswers).length} answered</span></div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6"><div className="bg-indigo-600 h-2 rounded-full" style={{width:`${(tQ+1)/qs.length*100}%`}}/></div>
            <div className="bg-gray-50 rounded-lg p-5 mb-5"><p className="text-gray-800 leading-relaxed">{q.passage}</p></div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{q.question}</h3>
            <div className="space-y-3 mb-6">
              {q.options.map((opt,idx)=>{
                const s=tSel===idx; const c=idx===q.correct; let cls="bg-white hover:bg-gray-50 border-gray-300"; let ico=null;
                if(tShowRes){if(c){cls="bg-green-50 border-green-500";ico=<CheckCircle className="w-5 h-5 text-green-600"/>;}else if(s){cls="bg-red-50 border-red-500";ico=<XCircle className="w-5 h-5 text-red-600"/>;}}else if(s){cls="bg-indigo-50 border-indigo-500";}
                return <button key={idx} onClick={()=>{if(!tShowRes){setTSel(idx);setTAnswers(a=>({...a,[tQ]:idx}));}}} disabled={tShowRes} className={`w-full text-left p-4 rounded-lg border-2 flex items-center justify-between ${cls}`}><span className="text-gray-800">{opt}</span>{ico}</button>;
              })}
            </div>
            <div className="flex justify-between">
              <button onClick={()=>{if(tQ>0){setTQ(q=>q-1);setTSel(tAnswers[tQ-1]??null);setTShowRes(false);}}} disabled={tQ===0} className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50">Previous</button>
              <div className="flex gap-3">
                {!tShowRes&&tSel!==null&&<button onClick={()=>setTShowRes(true)} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Submit Answer</button>}
                {tShowRes&&tQ<qs.length-1&&<button onClick={()=>{setTQ(q=>q+1);setTSel(tAnswers[tQ+1]??null);setTShowRes(false);}} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center">Next<ChevronRight className="w-4 h-4 ml-1"/></button>}
                {tShowRes&&tQ===qs.length-1&&<button onClick={doAdvance} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold">{tPartIdx<tParts.length-1?"Next Section":"Finish Test"}</button>}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // DASHBOARD
  if (showProgress) {
    const allHistory = Object.values(testHistory);
    const lrHistory = allHistory.filter(e=>e.section==='lr').sort((a,b)=>b.testNum-a.testNum);
    const rcHistory = allHistory.filter(e=>e.section==='rc').sort((a,b)=>b.testNum-a.testNum);
    const allMissed = {};
    allHistory.forEach(e=>{ Object.entries(e.missedTypes||{}).forEach(([t,c])=>{ allMissed[t]=(allMissed[t]||0)+c; }); });
    const sortedMissed = Object.entries(allMissed).sort((a,b)=>b[1]-a[1]);
    const lrAvg = lrHistory.length ? Math.round(lrHistory.reduce((a,e)=>a+e.pct,0)/lrHistory.length) : null;
    const rcAvg = rcHistory.length ? Math.round(rcHistory.reduce((a,e)=>a+e.pct,0)/rcHistory.length) : null;
    const totalTests = allHistory.length;
    const overallAvg = totalTests ? Math.round(allHistory.reduce((a,e)=>a+e.pct,0)/totalTests) : null;

    const ScoreBar = ({pct}) => (
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div className={`h-2 rounded-full ${pct>=80?'bg-green-500':pct>=60?'bg-yellow-500':'bg-red-500'}`} style={{width:`${pct}%`}}/>
        </div>
        <span className={`text-sm font-bold w-10 text-right ${pct>=80?'text-green-600':pct>=60?'text-yellow-600':'text-red-600'}`}>{pct}%</span>
      </div>
    );

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <button onClick={()=>setShowProgress(false)} className="text-indigo-600 hover:text-indigo-800 mb-6 flex items-center font-medium">Back to Dashboard</button>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My Progress</h1>
          <p className="text-gray-500 mb-8">Your practice test history and performance breakdown</p>

          {totalTests === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">📊</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">No data yet</h2>
              <p className="text-gray-500 mb-6">Complete a practice test and mark it as completed to start tracking your progress.</p>
              <button onClick={()=>setShowProgress(false)} className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700">Go Practice</button>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {[{label:"Tests Completed",value:totalTests,sub:"total across both sections"},{label:"Overall Average",value:overallAvg!==null?overallAvg+"%":"--",sub:"across all completed tests"},{label:"Weak Areas",value:sortedMissed.length>0?sortedMissed[0][0]:"None",sub:sortedMissed.length>0?`${sortedMissed[0][1]} questions missed`:"Keep it up!"}].map((s,i)=>(
                  <div key={i} className="bg-white rounded-xl shadow-lg p-6 text-center">
                    <div className="text-3xl font-bold text-indigo-600 mb-1">{s.value}</div>
                    <div className="font-semibold text-gray-800">{s.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{s.sub}</div>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {[{label:"Logical Reasoning",color:"bg-blue-900",history:lrHistory,avg:lrAvg},{label:"Reading Comprehension",color:"bg-red-600",history:rcHistory,avg:rcAvg}].map(({label,color,history,avg})=>(
                  <div key={label} className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-bold text-gray-800">{label}</h2>
                      {avg!==null && <span className={`text-sm font-bold px-3 py-1 rounded-full ${avg>=80?'bg-green-100 text-green-700':avg>=60?'bg-yellow-100 text-yellow-700':'bg-red-100 text-red-700'}`}>Avg: {avg}%</span>}
                    </div>
                    {history.length===0 ? (
                      <p className="text-gray-400 text-sm text-center py-4">No tests completed yet</p>
                    ) : (
                      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                        {history.map((e,i)=>(
                          <div key={i} className="flex items-center justify-between gap-3">
                            <div className="flex-shrink-0 w-28">
                              <p className="text-sm font-semibold text-gray-800">Test {e.testNum}</p>
                              <p className="text-xs text-gray-400">{e.date}</p>
                            </div>
                            <div className="flex-1"><ScoreBar pct={e.pct}/></div>
                            <div className="flex-shrink-0 text-right">
                              <p className="text-sm font-bold text-gray-800">{e.score}/{e.total}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {sortedMissed.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                  <h2 className="text-lg font-bold text-gray-800 mb-2">Question Types Missed</h2>
                  <p className="text-sm text-gray-500 mb-5">Based on all completed tests -- focus your study on the types at the top</p>
                  <div className="space-y-4">
                    {sortedMissed.map(([type, count], i) => {
                      const maxCount = sortedMissed[0][1];
                      const pct = Math.round(count/maxCount*100);
                      return (
                        <div key={i} className="flex items-center gap-4">
                          <div className="w-36 flex-shrink-0">
                            <p className="text-sm font-semibold text-gray-800">{type}</p>
                            <p className="text-xs text-gray-400">{count} question{count!==1?"s":""} missed</p>
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-3">
                            <div className={`h-3 rounded-full ${i===0?'bg-red-500':i===1?'bg-orange-400':i===2?'bg-yellow-400':'bg-indigo-400'}`} style={{width:`${pct}%`}}/>
                          </div>
                          <div className="w-8 text-right text-sm font-bold text-gray-600">{count}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Recommended next steps:</p>
                    <ul className="space-y-1">
                      {sortedMissed.slice(0,3).map(([type],i)=>(
                        <li key={i} className="text-sm text-gray-600 flex gap-2">
                          <span className="text-indigo-500 font-bold">-</span>
                          <span>Review the <button onClick={()=>{setShowProgress(false);setShowLearn(true);setLearnSec(type==='Main Point'||type==='Inference'||type==='Function'||type==='Author Attitude'||type==='Structure'?'rc':'lr');setLearnArt(null);}} className="text-indigo-600 font-semibold hover:underline">Learn section</button> for {type} questions</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">All Completed Tests</h2>
                {allHistory.length===0 ? <p className="text-gray-400 text-sm">No tests completed yet.</p> : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="text-left text-gray-500 border-b border-gray-100"><th className="pb-3 font-semibold">Section</th><th className="pb-3 font-semibold">Test</th><th className="pb-3 font-semibold">Score</th><th className="pb-3 font-semibold">Pct</th><th className="pb-3 font-semibold">Date</th><th className="pb-3 font-semibold">Top Missed</th></tr></thead>
                      <tbody>
                        {allHistory.sort((a,b)=>new Date(b.date)-new Date(a.date)).map((e,i)=>{
                          const topMissed = Object.entries(e.missedTypes||{}).sort((a,b)=>b[1]-a[1])[0];
                          return (
                            <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                              <td className="py-3"><span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${e.section==='lr'?'bg-blue-900':'bg-red-500'}`}>{e.section.toUpperCase()}</span></td>
                              <td className="py-3 font-medium text-gray-800">Test {e.testNum}</td>
                              <td className="py-3 text-gray-700">{e.score}/{e.total}</td>
                              <td className="py-3"><span className={`font-bold ${e.pct>=80?'text-green-600':e.pct>=60?'text-yellow-600':'text-red-600'}`}>{e.pct}%</span></td>
                              <td className="py-3 text-gray-500">{e.date}</td>
                              <td className="py-3 text-gray-600">{topMissed?`${topMissed[0]} (${topMissed[1]})`:"--"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (showDrill) {
    const getRandomQ = (type) => {
      const pool = type === 'lr' ? ALL_LR : type === 'rc' ? ALL_RC : Math.random() > 0.5 ? ALL_LR : ALL_RC;
      const idx = Math.floor(Math.random() * pool.length);
      return { ...pool[idx], sourceType: type === 'mixed' ? (pool === ALL_LR ? 'lr' : 'rc') : type };
    };

    const startDrill = (type) => {
      setDrillType(type);
      setDrillQ(getRandomQ(type));
      setDrillSel(null);
      setDrillShowRes(false);
    };

    const nextDrillQ = () => {
      setDrillQ(getRandomQ(drillType));
      setDrillSel(null);
      setDrillShowRes(false);
    };

    const submitDrill = () => {
      const isCorrect = drillSel === drillQ.correct;
      setDrillScore(s => ({ correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }));
      setDrillHistory(h => [...h, { correct: isCorrect }]);
      setDrillShowRes(true);
    };

    const isPremium = user && (user.isPremium || user.isAdmin);
    const pct = drillScore.total > 0 ? Math.round(drillScore.correct / drillScore.total * 100) : null;

    if (!drillType) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
          <div className="max-w-2xl mx-auto">
            <button onClick={()=>setShowDrill(false)} className="text-indigo-600 hover:text-indigo-800 mb-6 flex items-center font-medium">Back to Dashboard</button>
            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold text-gray-800 mb-3">Drill Mode</h1>
              <p className="text-gray-600 text-lg">Random questions from the full bank. Answer as many as you like -- no time limit, no pressure.</p>
              {!isPremium && <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mt-4 inline-block">Upgrade to Premium to unlock explanations after each question</p>}
            </div>
            <div className="grid gap-4">
              {[{type:'lr',label:'Logical Reasoning',desc:'Random LR questions from the full bank',color:'bg-blue-900'},{type:'rc',label:'Reading Comprehension',desc:'Random RC questions from the full bank',color:'bg-red-600'},{type:'mixed',label:'Mixed',desc:'Random mix of LR and RC questions',color:'bg-gradient-to-br from-purple-600 to-indigo-600'}].map(({type,label,desc,color})=>(
                <button key={type} onClick={()=>startDrill(type)} className={`${color} rounded-2xl p-8 text-white text-left hover:opacity-90 transition-all shadow-lg`}>
                  <h2 className="text-2xl font-bold mb-2">{label}</h2>
                  <p className="text-white opacity-80 text-sm">{desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button onClick={()=>{setDrillType(null);setDrillQ(null);setDrillSel(null);setDrillShowRes(false);}} className="text-indigo-600 hover:text-indigo-800 font-medium">Back to Drill Menu</button>
            {drillScore.total > 0 && (
              <div className="flex items-center gap-4 bg-white rounded-xl shadow px-5 py-2">
                <span className="text-sm text-gray-500">{drillScore.total} answered</span>
                <span className={`text-sm font-bold ${pct >= 70 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>{pct}% correct</span>
                <div className="flex gap-1">
                  {drillHistory.slice(-10).map((h,i) => <div key={i} className={`w-3 h-3 rounded-full ${h.correct ? 'bg-green-500' : 'bg-red-400'}`}/>)}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <div className="flex items-center justify-between mb-4">
              <span className={`text-xs font-bold px-3 py-1 rounded-full text-white ${drillQ.sourceType === 'lr' ? 'bg-blue-900' : 'bg-red-600'}`}>{drillQ.sourceType === 'lr' ? 'Logical Reasoning' : 'Reading Comprehension'}</span>
              <span className="text-sm text-gray-400">Question {drillScore.total + (drillShowRes ? 0 : 1)}</span>
            </div>

            <div className="bg-gray-50 rounded-lg p-5 mb-5"><p className="text-gray-800 leading-relaxed">{drillQ.passage}</p></div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{drillQ.question}</h3>

            <div className="space-y-3 mb-6">
              {drillQ.options.map((opt, idx) => {
                const sel = drillSel === idx; const cor = idx === drillQ.correct;
                let cls = "bg-white hover:bg-gray-50 border-gray-300"; let icon = null;
                if (drillShowRes) {
                  if (cor) { cls = "bg-green-50 border-green-500"; icon = <CheckCircle className="w-5 h-5 text-green-600"/>; }
                  else if (sel) { cls = "bg-red-50 border-red-500"; icon = <XCircle className="w-5 h-5 text-red-600"/>; }
                } else if (sel) { cls = "bg-indigo-50 border-indigo-500"; }
                return (
                  <button key={idx} onClick={()=>{ if (!drillShowRes) setDrillSel(idx); }} disabled={drillShowRes} className={`w-full text-left p-4 rounded-lg border-2 flex items-center justify-between ${cls}`}>
                    <span className="text-gray-800">{opt}</span>{icon}
                  </button>
                );
              })}
            </div>

            {drillShowRes && (
              <div className={`rounded-lg p-5 mb-6 border-2 ${isPremium ? 'bg-blue-50 border-blue-200' : 'bg-indigo-50 border-indigo-200'}`}>
                {isPremium ? (
                  <>
                    <div className="flex items-center gap-2 mb-3"><Crown className="w-5 h-5 text-yellow-500"/><span className="font-semibold text-gray-800">Premium Explanation</span></div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200 mb-3">
                      <div className="flex items-center gap-2 mb-1"><CheckCircle className="w-4 h-4 text-green-600"/><span className="font-semibold text-green-800 text-sm">Why the correct answer is right:</span></div>
                      <p className="text-gray-700 text-sm">This answer correctly identifies the core issue. It accurately reflects what the question is asking without adding unsupported inferences or misrepresenting the scope of the claim.</p>
                    </div>
                    {drillSel !== drillQ.correct && (
                      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center gap-2 mb-1"><XCircle className="w-4 h-4 text-red-600"/><span className="font-semibold text-red-800 text-sm">Why your answer was incorrect:</span></div>
                        <p className="text-gray-700 text-sm">This answer misidentifies the key issue. While it may seem plausible, it either overstates, understates, or shifts focus away from the primary concern the question targets.</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5"/>
                    <div>
                      <p className="font-semibold text-gray-800 mb-1 flex items-center gap-2">Detailed Explanations <Crown className="w-4 h-4 text-yellow-500"/></p>
                      <p className="text-gray-600 text-sm mb-3">Upgrade to Premium to see why each answer is right or wrong after every question.</p>
                      <button onClick={()=>upgrade(true)} className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-indigo-700">Upgrade to Premium - $45/month</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between">
              {!drillShowRes ? (
                <button onClick={submitDrill} disabled={drillSel === null} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed">Submit Answer</button>
              ) : (
                <button onClick={nextDrillQ} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 flex items-center justify-center gap-2">Next Question <ChevronRight className="w-5 h-5"/></button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!section) {
    const SECTIONS = {
      lr:{name:"Logical Reasoning",icon:Brain,desc:"Analyze arguments and identify reasoning patterns",count:50},
      rc:{name:"Reading Comprehension",icon:BookOpen,desc:"Analyze complex passages and answer questions",count:50},
    };
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-4 mb-8 flex flex-wrap justify-between items-center gap-3">
            <div className="flex items-center gap-3"><User className="w-8 h-8 text-indigo-600"/><div><p className="font-semibold text-gray-800">{user.username}</p><p className="text-sm text-gray-600">{user.email}</p></div></div>
            <div className="flex items-center gap-2 flex-wrap">
              {user.isPremium&&<span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1"><Crown className="w-4 h-4"/>Premium</span>}
              <button onClick={()=>setShowProgress(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-semibold"><CheckCircle className="w-4 h-4"/>My Progress</button>
              <button onClick={()=>setShowAccount(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-semibold"><User className="w-4 h-4"/>My Account</button>
              <button onClick={()=>setShowTerms(true)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">Terms</button>
              <button onClick={doLogout} className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"><LogOut className="w-4 h-4"/>Logout</button>
            </div>
          </div>
          <div className="text-center mb-8"><h1 className="text-4xl font-bold text-gray-800 mb-3">Specter LSAT Prep</h1><p className="text-gray-500">2,600 questions per section -- 100 practice tests of 26 questions each</p></div>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <button onClick={()=>{setShowLearn(true);setLearnSec(null);setLearnArt(null);}} className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg p-8 hover:shadow-xl text-white text-center"><div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4"><BookOpen className="w-6 h-6"/></div><h2 className="text-xl font-bold mb-2">Learn</h2><p className="text-emerald-100 text-sm mb-4">Strategy guides for every question type</p><div className="text-emerald-200 text-sm font-semibold">3 Sections -- 17 Articles -- Free for all users</div></button>
            <button onClick={()=>canAccess?startTimed():setShowAccess(true)} className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl shadow-lg p-8 hover:shadow-xl text-white text-center relative">{!canAccess&&<Lock className="w-5 h-5 text-white opacity-70 absolute top-4 right-4"/>}<div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4"><List className="w-6 h-6"/></div><h2 className="text-xl font-bold mb-2">Timed Full Test</h2><p className="text-indigo-100 text-sm mb-4">Real LSAT conditions, 3 sections</p><div className="text-indigo-200 text-sm font-semibold">78 Questions -- 35 min each</div></button>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <button onClick={()=>{setShowDrill(true);setDrillType(null);setDrillQ(null);setDrillSel(null);setDrillShowRes(false);setDrillScore({correct:0,total:0});setDrillHistory([]);}} className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl shadow-lg p-8 hover:shadow-xl text-white text-center col-span-full">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4"><Brain className="w-6 h-6"/></div>
              <h2 className="text-xl font-bold mb-2">Drill Mode</h2>
              <p className="text-orange-100 text-sm mb-4">Random questions from the full bank -- free for everyone, explanations for Premium</p>
              <div className="text-orange-200 text-sm font-semibold">LR -- RC -- Mixed -- Free for all users</div>
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(SECTIONS).map(([key,sec])=>{
              const Icon=sec.icon; const bg=key==="lr"?"bg-gradient-to-br from-blue-900 to-blue-800":"bg-gradient-to-br from-red-500 to-red-600";
              return <button key={key} onClick={()=>canAccess?setSection(key):setShowAccess(true)} className={`${bg} rounded-xl shadow-lg p-8 hover:shadow-xl text-white text-center relative`}>{!canAccess&&<Lock className="w-5 h-5 text-white opacity-70 absolute top-4 right-4"/>}<Icon className="w-12 h-12 text-white mx-auto mb-4"/><h2 className="text-xl font-bold mb-2">{sec.name}</h2><p className="text-blue-200 text-sm mb-4">{sec.desc}</p><div className="text-white text-sm font-semibold">1,300 Questions -- {sec.count} Tests</div>{!canAccess&&<div className="mt-3 text-xs text-blue-200">Subscription Required</div>}</button>;
            })}
          </div>
        </div>
        {showPaywall&&<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl text-center"><Crown className="w-16 h-16 text-yellow-500 mx-auto mb-4"/><h2 className="text-2xl font-bold text-gray-800 mb-2">Unlock Premium Explanations</h2><p className="text-gray-600 mb-6">Get detailed explanations for every answer</p><div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white mb-6"><div className="text-5xl font-bold">$45</div><div>per month</div></div><button onClick={()=>upgrade(true)} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 mb-3">Subscribe - $45/month</button><button onClick={()=>setShowPaywall(false)} className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold">Maybe Later</button></div></div>}
        {showAccess&&<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl"><div className="text-center mb-6"><Lock className="w-12 h-12 text-indigo-600 mx-auto mb-3"/><h2 className="text-2xl font-bold text-gray-800">Choose Your Plan</h2></div><div className="grid grid-cols-2 gap-4 mb-4"><div className="border-2 border-gray-200 rounded-xl p-5"><div className="text-3xl font-bold mb-1">$35</div><div className="text-gray-500 text-sm mb-3">per month</div><div className="font-bold mb-3">Test Access</div><div className="space-y-2 text-sm mb-4"><div className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5"/><span>All 2,600 questions</span></div><div className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5"/><span>100 practice tests</span></div><div className="flex gap-2"><XCircle className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5"/><span className="text-gray-400">No explanations</span></div></div><button onClick={()=>upgrade(false)} className="w-full bg-gray-800 text-white py-2 rounded-lg font-semibold hover:bg-gray-900 text-sm">Get Access</button></div><div className="border-2 border-indigo-500 rounded-xl p-5 bg-indigo-50 relative"><div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs px-3 py-1 rounded-full font-bold">BEST VALUE</div><div className="text-3xl font-bold mb-1">$45</div><div className="text-gray-500 text-sm mb-3">per month</div><div className="font-bold mb-3">Premium</div><div className="space-y-2 text-sm mb-4"><div className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5"/><span>All 2,600 questions</span></div><div className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5"/><span>100 practice tests</span></div><div className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5"/><span className="font-semibold">Full explanations</span></div></div><button onClick={()=>upgrade(true)} className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 text-sm">Get Premium</button></div></div><button onClick={()=>setShowAccess(false)} className="w-full text-gray-500 hover:text-gray-700 font-semibold">Maybe Later</button></div></div>}
        {showTerms&&<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl"><h2 className="text-2xl font-bold mb-4">Terms of Service</h2><div className="text-sm text-gray-700 space-y-3 max-h-64 overflow-y-auto"><p><strong>1.</strong> By using Specter LSAT Prep, you agree to these Terms.</p><p><strong>2.</strong> Test Access ($35/mo): all questions and tests. Premium ($45/mo): adds detailed explanations.</p><p><strong>3. NO REFUNDS ARE PROVIDED.</strong></p><p><strong>4.</strong> Governed by laws of Florida, USA.</p><p><strong>5.</strong> specterlsatprep@gmail.com</p></div><button onClick={()=>setShowTerms(false)} className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700">Close</button></div></div>}
        {showAccount&&<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl"><div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-gray-800">My Account</h2><button onClick={()=>{setShowAccount(false);setShowCancel(false);}} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">x</button></div>{!showCancel?(<><div className="space-y-3 mb-6">{[["Username",user.username],["Email",user.email||"Not provided"],["Member Since",user.createdAt?new Date(user.createdAt).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}):"N/A"],["Tests Completed",`${Object.keys(completed).length} practice test${Object.keys(completed).length!==1?"s":""}`]].map(([l,v])=><div key={l} className="bg-gray-50 rounded-xl p-4"><p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">{l}</p><p className="text-gray-800 font-medium">{v}</p></div>)}<div className="bg-gray-50 rounded-xl p-4"><p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Subscription</p>{user.isAdmin?<span className="bg-gray-800 text-white text-xs px-3 py-1 rounded-full font-bold">Admin</span>:user.isPremium?<span className="bg-yellow-400 text-gray-900 text-xs px-3 py-1 rounded-full font-bold">Premium - $45/month</span>:user.hasTestAccess?<span className="bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full font-bold">Test Access - $35/month</span>:<span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-bold">Free</span>}</div></div><div className="space-y-3">{(user.isPremium||user.hasTestAccess)&&!user.isAdmin&&<button onClick={()=>setShowCancel(true)} className="w-full py-3 rounded-xl font-semibold border-2 border-red-300 text-red-600 hover:bg-red-50">Cancel Subscription</button>}<button onClick={()=>{setShowAccount(false);doLogout();}} className="w-full py-3 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center justify-center gap-2"><LogOut className="w-4 h-4"/>Sign Out</button></div></>):(<div className="text-center"><h3 className="text-xl font-bold text-gray-800 mb-2">Cancel Your Subscription?</h3><p className="text-gray-600 mb-2">You will lose access at the end of your current billing period.</p><p className="text-sm text-gray-500 mb-6">You can cancel directly through Stripe's secure customer portal. No need to contact us.</p><div className="space-y-3"><a href="https://billing.stripe.com/p/login/3cI7sE2wgbsg9uveXJ7EQ00" target="_blank" rel="noopener noreferrer" className="w-full py-3 rounded-xl font-semibold bg-red-600 text-white hover:bg-red-700 block text-center">Manage Subscription in Stripe</a><button onClick={()=>setShowCancel(false)} className="w-full py-3 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200">Keep My Subscription</button></div></div>)}</div></div>}
      </div>
    );
  }

  // TEST SELECTION
  const SECS = { lr:{name:"Logical Reasoning",icon:Brain,count:50}, rc:{name:"Reading Comprehension",icon:BookOpen,count:50} };
  if (testIdx === null) {
    const sec = SECS[section]; const Icon = sec.icon;
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-5xl mx-auto">
          <button onClick={()=>setSection(null)} className="text-indigo-600 hover:text-indigo-800 mb-6 flex items-center">Back to Sections</button>
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8"><div className="flex items-center gap-4"><Icon className="w-10 h-10 text-indigo-600"/><div><h2 className="text-3xl font-bold text-gray-800">{sec.name}</h2><p className="text-gray-600">Select a practice test -- 26 questions each</p></div></div></div>
          <div className="grid md:grid-cols-3 gap-4">
            {Array.from({length:sec.count},(_,i)=>{
              const tk=`${section}-${i}`; const done=completed[tk];
              return <button key={i} onClick={()=>{setTestIdx(i);setQIdx(0);setAnswers({});setShowRes(false);setSelAns(null);}} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg hover:bg-indigo-50 border-2 border-transparent hover:border-indigo-300 relative">{done&&<CheckCircle className="w-6 h-6 text-green-600 absolute top-2 right-2"/>}<List className="w-8 h-8 text-indigo-600 mx-auto mb-3"/><h3 className="text-lg font-bold text-gray-800">Practice Test {i+1}</h3><p className="text-sm text-gray-600 mt-1">Questions {i*26+1}--{(i+1)*26}</p>{done&&<p className="text-xs text-green-600 mt-2 font-semibold">Completed</p>}</button>;
            })}
          </div>
        </div>
      </div>
    );
  }

  // QUESTION SCREEN
  const qs = getQs(section, testIdx); const q = qs[qIdx];
  if (!q) return <div className="p-8 text-center text-gray-600">Loading...</div>;
  const prog = (qIdx + 1) / qs.length * 100;
  const allDone = Object.keys(answers).length === qs.length;
  const sc = { correct: Object.keys(answers).filter(k=>answers[k]===qs[+k]?.correct).length, total: qs.length };
  const tk = `${section}-${testIdx}`; const isDone = completed[tk];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <button onClick={()=>{setTestIdx(null);setQIdx(0);setAnswers({});setShowRes(false);setSelAns(null);}} className="text-indigo-600 hover:text-indigo-800 mb-4 flex items-center">Back to Practice Tests</button>
          <div className="flex justify-between items-center mb-3">
            <div><h2 className="text-2xl font-bold text-gray-800">{SECS[section].name}</h2><p className="text-sm text-gray-600">Practice Test {testIdx+1}</p></div>
            <span className="text-gray-600">Question {qIdx+1} of {qs.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6"><div className="bg-indigo-600 h-2 rounded-full" style={{width:`${prog}%`}}/></div>
          <div className="bg-gray-50 rounded-lg p-6 mb-6"><p className="text-gray-800 leading-relaxed">{q.passage}</p></div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{q.question}</h3>
          <div className="space-y-3 mb-6">
            {q.options.map((opt,idx)=>{
              const s=selAns===idx; const c=idx===q.correct; let cls="bg-white hover:bg-gray-50 border-gray-300"; let ico=null;
              if(showRes){if(c){cls="bg-green-50 border-green-500";ico=<CheckCircle className="w-5 h-5 text-green-600"/>;}else if(s){cls="bg-red-50 border-red-500";ico=<XCircle className="w-5 h-5 text-red-600"/>;}}else if(s){cls="bg-indigo-50 border-indigo-500";}
              return <button key={idx} onClick={()=>{if(!showRes){setSelAns(idx);setAnswers(a=>({...a,[qIdx]:idx}));}}} disabled={showRes} className={`w-full text-left p-4 rounded-lg border-2 flex items-center justify-between ${cls}`}><span className="text-gray-800">{opt}</span>{ico}</button>;
            })}
          </div>

          {showRes&&(
            <div className={`rounded-lg p-6 mb-6 border-2 ${user.isPremium&&isDone?"bg-blue-50 border-blue-200":"bg-indigo-50 border-indigo-200"}`}>
              {user.isPremium&&isDone?(<>
                <div className="flex items-center gap-2 mb-4"><Crown className="w-5 h-5 text-yellow-500"/><span className="font-semibold text-gray-800">Premium Explanations</span></div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200 mb-3"><div className="flex items-center gap-2 mb-2"><CheckCircle className="w-5 h-5 text-green-600"/><span className="font-semibold text-green-800">Why the correct answer is right:</span></div><p className="text-gray-700 text-sm">This answer correctly identifies the core issue. It accurately reflects what the question is asking without adding unsupported inferences or misrepresenting the scope of the claim.</p></div>
                {selAns!==q.correct&&<div className="p-4 bg-red-50 rounded-lg border border-red-200"><div className="flex items-center gap-2 mb-2"><XCircle className="w-5 h-5 text-red-600"/><span className="font-semibold text-red-800">Why your answer was incorrect:</span></div><p className="text-gray-700 text-sm">This answer misidentifies the key issue. While it may seem plausible, it either overstates, understates, or shifts focus away from the primary concern the question targets.</p></div>}
              </>):(
                <div className="flex items-start gap-4"><Lock className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1"/>
                  <div><h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">Detailed Explanations<Crown className="w-5 h-5 text-yellow-500"/></h4>
                  <p className="text-gray-700 text-sm mb-3">{!isDone?"Complete all 26 questions to unlock explanations with Premium.":"Upgrade to Premium to access detailed explanations."}</p>
                  {isDone&&<button onClick={()=>setShowPaywall(true)} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold text-sm hover:bg-indigo-700">Unlock Explanations -- $45/month</button>}</div>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-3 justify-between">
            <button onClick={()=>{if(qIdx>0){setQIdx(q=>q-1);setSelAns(answers[qIdx-1]??null);setShowRes(false);}}} disabled={qIdx===0} className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50">Previous</button>
            <div className="flex gap-3">
              {!showRes&&selAns!==null&&<button onClick={()=>setShowRes(true)} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Submit Answer</button>}
              {showRes&&qIdx<qs.length-1&&<button onClick={()=>{setQIdx(q=>q+1);setSelAns(answers[qIdx+1]??null);setShowRes(false);}} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center">Next<ChevronRight className="w-4 h-4 ml-1"/></button>}
              {qIdx===qs.length-1&&<button onClick={()=>{setQIdx(0);setAnswers({});setShowRes(false);setSelAns(null);}} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"><RotateCcw className="w-4 h-4 mr-2"/>Restart</button>}
            </div>
          </div>

          {qIdx===qs.length-1&&showRes&&allDone&&(
            <div className="mt-6 p-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg text-white text-center">
              <h3 className="text-2xl font-bold mb-2">Test Complete!</h3>
              <p className="text-lg">Score: {sc.correct} / {sc.total}</p>
              <p className="text-sm mt-1 opacity-90">{Math.round(sc.correct/sc.total*100)}% Correct</p>
              {!isDone&&<button onClick={()=>{
                  setCompleted(c=>({...c,[tk]:true}));
                  const missedTypes = Object.keys(answers).filter(k=>answers[k]!==qs[+k]?.correct).map(k=>{
                    const q=qs[+k]; if(!q) return null;
                    const t=q.question.toLowerCase();
                    if(t.includes('flaw')||t.includes('vulnerable')) return 'Flaw';
                    if(t.includes('assumption')) return 'Assumption';
                    if(t.includes('strengthen')) return 'Strengthen';
                    if(t.includes('weaken')) return 'Weaken';
                    if(t.includes('must be true')||t.includes('inferred')||t.includes('conclude')) return 'Inference';
                    if(t.includes('parallel')) return 'Parallel Reasoning';
                    if(t.includes('principle')) return 'Principle';
                    if(t.includes('method')||t.includes('proceeds by')) return 'Method';
                    if(t.includes('main point')||t.includes('primary purpose')) return 'Main Point';
                    if(t.includes('function')||t.includes('primarily in order to')) return 'Function';
                    if(t.includes('author')) return 'Author Attitude';
                    if(t.includes('structure')||t.includes('organization')) return 'Structure';
                    return section==='lr'?'Logical Reasoning':'Reading Comprehension';
                  }).filter(Boolean);
                  const typeCounts={};
                  missedTypes.forEach(t=>{typeCounts[t]=(typeCounts[t]||0)+1;});
                  const entry={section,testNum:testIdx+1,score:sc.correct,total:sc.total,pct:Math.round(sc.correct/sc.total*100),date:new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}),missedTypes:typeCounts};
                  setTestHistory(h=>({...h,[tk]:entry}));
                }} className="mt-4 bg-white text-indigo-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100">Mark as Completed</button>}
              {isDone&&!user.isPremium&&<button onClick={()=>setShowPaywall(true)} className="mt-4 bg-yellow-400 text-gray-900 px-6 py-2 rounded-lg font-semibold flex items-center gap-2 mx-auto"><Crown className="w-5 h-5"/>Unlock Explanations</button>}
            </div>
          )}
        </div>
      </div>
      {showPaywall&&<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl text-center"><Crown className="w-16 h-16 text-yellow-500 mx-auto mb-4"/><h2 className="text-2xl font-bold text-gray-800 mb-2">Unlock Premium Explanations</h2><p className="text-gray-600 mb-6">Get detailed explanations for every answer</p><div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white mb-6"><div className="text-5xl font-bold">$45</div><div>per month</div></div><button onClick={()=>upgrade(true)} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 mb-3">Subscribe - $45/month</button><button onClick={()=>setShowPaywall(false)} className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold">Maybe Later</button></div></div>}
    </div>
  );
}
