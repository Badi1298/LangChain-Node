let result = {
  isLowStrike: "",
  isEuropeanBarrier: "",
  isAmericanBarrier: "",
};

// Execute all queries (streams) concurrently
const [flagChunks] = await Promise.all([
  runnableRagChain.stream(
    "Does the document have the exact string 'Barrier Event'?"
  ),
]);

for await (const chunk of flagChunks) {
  result.isLowStrike += chunk;
}

console.log(result.isLowStrike);

result.isLowStrike = isActiveFlag(result.isLowStrike);

if (!result.isLowStrike) {
  const europeanBarrierChunks = await runnableRagChain.stream(
    "Does the document contain the text 'Barrier Observation Period'?"
  );

  for await (const chunk of europeanBarrierChunks) {
    result.isEuropeanBarrier += chunk;
  }
}

console.log(result.isEuropeanBarrier);

result.isEuropeanBarrier = isActiveFlag(result.isEuropeanBarrier);

if (!result.isLowStrike && !result.isEuropeanBarrier) {
  const errorChunks = await runnableRagChain.stream(
    "Is the Barrier Observation Period start date different from the Barrier Observation Period end date?"
  );

  let error = "";

  for await (const chunk of errorChunks) {
    error += chunk;
  }

  if (error.toLocaleLowerCase().includes("no")) {
    res.status(500).json({
      message: "Barrier Observation Period dates are the same.",
    });
  }

  const americanBarrierChunks = await runnableRagChain.stream(
    "Is the string 'closing level' present between the sections titled 'Barrier Event' and 'Barrier Observation Period'?"
  );

  for await (const chunk of americanBarrierChunks) {
    result.isAmericanBarrier += chunk;
  }
}

console.log(result.isAmericanBarrier);

result.isAmericanBarrier = isActiveFlag(result.isAmericanBarrier);
